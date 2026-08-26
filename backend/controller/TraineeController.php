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
        $id = $this->model->create($data);
        http_response_code(201); echo json_encode(['success' => true, 'id' => $id]);
    }

    public function updateImages() {
        if (!$this->requireAdmin() || !$this->requirePostCsrf()) return;
        $input = $this->input(); $id = $this->normalizeId($input);
        if (!$id || $id < 1) { $this->error('A valid trainee ID is required'); return; }
        $images = [];
        foreach (['avatar' => 'avatar', 'profileImage' => 'profileImage'] as $key => $column) {
            if (!array_key_exists($key, $input)) continue;
            $image = (string) $input[$key];
            if (!preg_match('#^data:image/(?:jpeg|png|webp);base64,#', $image) || strlen($image) > 7000000) {
                $this->error($key === 'avatar' ? 'Grid Illustration file too large or invalid.' : 'Profile Photo file too large or invalid.'); return;
            }
            $images[$column] = $image;
        }
        if (count($images) === 0) { $this->error('At least one image is required'); return; }
        $this->model->updateImages($id, $images); echo json_encode(['success' => true]);
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
    private function input() { $input = json_decode(file_get_contents('php://input'), true); return is_array($input) ? $input : []; }
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
        $avatar = (string) $this->value($input, ['avatar'], '');
        $profileImage = (string) $this->value($input, ['profileImage', 'profile_image'], $avatar);
        if ($requireImages && ($avatar === '' || $profileImage === '')) { $this->error('Both a grid illustration and profile photo are required'); return null; }
        if ($avatar !== '' && (!preg_match('#^data:image/(?:jpeg|png|webp);base64,#', $avatar) || strlen($avatar) > 7000000)) { $this->error('Photo must be a JPG, PNG or WEBP image smaller than 5MB'); return null; }
        if ($profileImage !== '' && (!preg_match('#^data:image/(?:jpeg|png|webp);base64,#', $profileImage) || strlen($profileImage) > 7000000)) { $this->error('Profile photo must be a JPG, PNG or WEBP image smaller than 5MB'); return null; }
        $data = ['name' => $name, 'title' => $title, 'cohort' => $cohort, 'status' => $status, 'avatar' => $avatar, 'profileImage' => $profileImage];
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
        return $values;
    }
    private function error($message) { http_response_code(400); echo json_encode(['error' => $message]); }
}
