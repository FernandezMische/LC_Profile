<?php
require_once __DIR__ . '/../model/Trainee.php';

class TraineeController {
    private $model;
    public function __construct() { $this->model = new Trainee(); }

    public function publicList() { echo json_encode(['success' => true, 'trainees' => $this->model->getPublic()]); }

    public function list() {
        if (!$this->requireAdmin()) return;
        echo json_encode(['success' => true, 'trainees' => $this->model->getAll()]);
    }

    public function cohorts() {
        if (!$this->requireAdmin()) return;
        echo json_encode(['success' => true, 'cohorts' => $this->model->getCohorts()]);
    }

    public function create() {
        if (!$this->requireAdmin() || !$this->requirePostCsrf()) return;
        $data = $this->validatedInput(null, false); if ($data === null) return;
        if (!isset($_FILES['avatar'], $_FILES['profileImage'])) {
            $this->error('Both a grid illustration and a profile photo are required'); return;
        }
        $id = $this->model->create($data);
        try {
            $images = $this->saveUploadedImages($id, $_FILES);
            $this->model->updateImages($id, $images);
        } catch (InvalidArgumentException $e) {
            $this->model->delete($id);
            $this->removeStoredImages($id);
            $this->error($e->getMessage()); return;
        } catch (Throwable $e) {
            $this->model->delete($id);
            $this->removeStoredImages($id);
            throw $e;
        }
        http_response_code(201); echo json_encode(['success' => true, 'id' => $id]);
    }

    public function updateImages() {
        if (!$this->requireAdmin() || !$this->requirePostCsrf()) return;
        $input = $_POST; $id = $this->normalizeId($input);
        if (!$id || $id < 1) { $this->error('A valid trainee ID is required'); return; }
        try {
            $images = $this->saveUploadedImages($id, $_FILES);
        } catch (InvalidArgumentException $e) {
            $this->error($e->getMessage()); return;
        }
        try {
            // Build the keep-list BEFORE writing: the new files being saved,
            // plus any image the database still references that is NOT being
            // replaced by this request. Otherwise a single-image update would
            // delete the other image's file while its URL is still in MySQL
            // (and two parallel per-image requests would delete each other's
            // freshly saved files).
            $current = $this->model->getImageUrls($id);
            $keep = array_values($images);
            foreach (['avatar' => 'avatar_url', 'profileImage' => 'profile_image_url'] as $column => $field) {
                if (!isset($images[$column]) && !empty($current[$field])) {
                    $keep[] = $current[$field];
                }
            }
            $this->model->updateImages($id, $images);
            $this->removeStoredImages($id, $keep);
        } catch (Throwable $e) {
            throw $e;
        }
        echo json_encode(['success' => true, 'images' => $images]);
    }

    private function saveUploadedImages($id, $files) {
        $uploads = ['avatar' => 'avatar', 'profileImage' => 'profileImage'];
        $images = [];
        $directory = __DIR__ . '/../../images/trainees';
        if (!is_dir($directory) && !mkdir($directory, 0755, true)) {
            throw new RuntimeException('The image upload directory is not available.');
        }
        foreach ($uploads as $key => $column) {
            if (!isset($files[$key])) continue;
            $file = $files[$key];
            if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > 5 * 1024 * 1024) {
                throw new InvalidArgumentException($key === 'avatar' ? 'Grid Illustration file is too large or invalid.' : 'Profile Photo file is too large or invalid.');
            }
            $imageInfo = @getimagesize($file['tmp_name']);
            $mimeTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
            $mime = $imageInfo['mime'] ?? '';
            if (!$imageInfo || !isset($mimeTypes[$mime])) {
                throw new InvalidArgumentException($key === 'avatar' ? 'Grid Illustration must be a JPG, PNG or WEBP image.' : 'Profile Photo must be a JPG, PNG or WEBP image.');
            }
            // A new filename gives every uploaded image a new URL. Static images
            // are intentionally cached by the server, so overwriting a fixed URL
            // (for example, "1-avatar.jpg") would otherwise keep showing an old
            // portrait until the browser cache expires.
            $filename = (int) $id . '-' . $key . '-' . bin2hex(random_bytes(8)) . '.' . $mimeTypes[$mime];
            $path = $directory . '/' . $filename;
            if (!move_uploaded_file($file['tmp_name'], $path)) throw new RuntimeException('The image could not be saved.');
            $images[$column] = '/images/trainees/' . $filename;
        }
        if (count($images) === 0) throw new InvalidArgumentException('At least one image is required');
        return $images;
    }

    public function update() {
        if (!$this->requireAdmin() || !$this->requirePostCsrf()) return;
        $input = $this->input(); $id = $this->normalizeId($input);
        if (!$id || $id < 1) { $this->error('A valid trainee ID is required'); return; }
        $data = $this->validatedInput($input); if ($data === null) return;
        $this->model->update($id, $data); echo json_encode(['success' => true]);
    }

    public function updateDetails() {
        if (!$this->requireAdmin() || !$this->requirePostCsrf()) return;
        $input = $this->input(); $id = $this->normalizeId($input);
        if (!$id || $id < 1) { $this->error('A valid trainee ID is required'); return; }
        $data = $this->validatedInput($input, false); if ($data === null) return;
        unset($data['avatar'], $data['profileImage'], $data['cv'], $data['portfolio'], $data['linkedin'], $data['github']);
        $this->model->updateDetails($id, $data); echo json_encode(['success' => true]);
    }

    public function updateLinks() {
        if (!$this->requireAdmin() || !$this->requirePostCsrf()) return;
        $input = $this->input(); $id = $this->normalizeId($input);
        if (!$id || $id < 1) { $this->error('A valid trainee ID is required'); return; }
        $links = $this->validatedLinks($input);
        if ($links === null) return;
        $this->model->updateLinks($id, $links); echo json_encode(['success' => true]);
    }

    public function delete() {
        if (!$this->requireAdmin() || !$this->requirePostCsrf()) return;
        $input = $this->input(); $id = $this->normalizeId($input);
        if (!$id || $id < 1) { $this->error('A valid trainee ID is required'); return; }
        if (!$this->model->delete($id)) { http_response_code(404); echo json_encode(['error' => 'Trainee not found']); return; }
        $this->removeStoredImages($id);
        echo json_encode(['success' => true]);
    }

    private function requireAdmin() {
        secureSessionStart();
        if (isset($_SESSION['user_id'])) return true;
        http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return false;
    }
    private function requirePostCsrf() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); return false; }
        return requireCsrfToken();
    }
    private function input() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST)) return $_POST;
        $input = json_decode(file_get_contents('php://input'), true);
        return is_array($input) ? $input : [];
    }
    private function normalizeId($input) {
        foreach (['id', 'traineeId', 'trainee_id'] as $key) {
            if (array_key_exists($key, $input) && $input[$key] !== '') {
                return filter_var($input[$key], FILTER_VALIDATE_INT);
            }
        }
        return false;
    }
    private function value($input, $keys, $default = '') {
        foreach ((array) $keys as $key) {
            if (array_key_exists($key, $input)) {
                return $input[$key];
            }
        }
        return $default;
    }
    private function normalizeLink($value) {
        $link = trim((string) $value);
        if ($link !== '' && !preg_match('#^[a-z][a-z0-9+.-]*://#i', $link)) $link = 'https://' . $link;
        return $link;
    }
    private function validatedLinks($input) {
        $links = ['cv' => ['cv', 'cvLink', 'cv_link'], 'portfolio' => ['portfolio', 'portfolioLink', 'portfolio_link'], 'linkedin' => ['linkedin', 'linkedIn', 'linkedin_link'], 'github' => ['github', 'githubLink', 'github_link']];
        $data = [];
        foreach ($links as $column => $keys) {
            $value = $this->normalizeLink($this->value($input, $keys, ''));
            if ($value !== '' && (!filter_var($value, FILTER_VALIDATE_URL) || strlen($value) > 2048)) { $this->error('Please provide valid links'); return null; }
            $data[$column] = $value ?: null;
        }
        return $data;
    }
    private function validatedInput($input = null, $requireImages = true) {
        $input = $input === null ? $this->input() : $input;
        $name = trim((string) $this->value($input, ['name'], '')); $title = trim((string) $this->value($input, ['title'], ''));
        $cohort = filter_var($this->value($input, ['cohort'], ''), FILTER_VALIDATE_INT);
        $statusValue = $this->value($input, ['status'], (($this->value($input, ['employed'], false) === true) ? 'employed' : 'freelance'));
        $statusList = $this->normalizeStatusList($statusValue);
        if ($name === '' || mb_strlen($name) > 150 || $title === '' || mb_strlen($title) > 150 || !$cohort || $cohort > 9999 || count($statusList) === 0) { $this->error('Please provide a valid name, title, cohort and status'); return null; }
        $status = implode(',', $statusList);
        $data = ['name' => $name, 'title' => $title, 'cohort' => $cohort, 'status' => $status];
        $linkData = $this->validatedLinks($input);
        if ($linkData === null) return null;
        $data = array_merge($data, $linkData);
        return $data;
    }
    private function normalizeStatusList($statusValue) {
        $allowed = ['freelance', 'opportunities', 'employed'];
        $items = is_array($statusValue) ? $statusValue : preg_split('/[|,]/', (string) $statusValue);
        $values = [];
        foreach ((array) $items as $value) {
            $item = strtolower(trim((string) $value));
            if ($item === '' || !in_array($item, $allowed, true)) continue;
            if (!in_array($item, $values, true)) $values[] = $item;
        }

        $hasEmployed = in_array('employed', $values, true);
        $hasOpportunities = in_array('opportunities', $values, true);
        if ($hasEmployed && $hasOpportunities) {
            $values = array_values(array_filter($values, fn($status) => $status !== 'opportunities'));
        }

        return $values;
    }
    private function removeStoredImages($id, $keep = []) {
        $directory = __DIR__ . '/../../images/trainees';
        foreach (glob($directory . '/' . (int) $id . '-*.{jpg,jpeg,png,webp}', GLOB_BRACE) ?: [] as $path) {
            $url = '/images/trainees/' . basename($path);
            if (!in_array($url, $keep, true) && is_file($path)) unlink($path);
        }
    }
    private function error($message) { http_response_code(400); echo json_encode(['error' => $message]); }
}
