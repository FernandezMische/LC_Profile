<?php
require_once __DIR__ . '/../config/database.php';

class Trainee {
    private $pdo;

    public function __construct() {
        $this->pdo = getDBConnection();
        $this->ensureProfileImageColumn();
    }

    private function ensureProfileImageColumn() {
        $column = $this->pdo->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'trainees' AND COLUMN_NAME = 'profile_image_data'");
        $column->execute();
        if (!(int) $column->fetchColumn()) {
            $this->pdo->exec('ALTER TABLE trainees ADD COLUMN profile_image_data MEDIUMTEXT NULL AFTER avatar_data');
        }
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT id, full_name AS name, title, cohort, status, avatar_data AS avatar, profile_image_data AS profileImage,
            cv_link AS cvLink, portfolio_link AS portfolioLink, linkedin_link AS linkedIn, github_link AS github,
            (status = 'employed') AS employed
            FROM trainees ORDER BY created_at DESC, id DESC");
        return $stmt->fetchAll();
    }

    public function getCohorts() {
        $standardCohorts = [13, 14, 15, 16, 17];
        $stmt = $this->pdo->query('SELECT DISTINCT cohort FROM trainees WHERE cohort IS NOT NULL ORDER BY cohort ASC');
        $rows = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
        $cohorts = [];

        foreach ($standardCohorts as $cohort) {
            $cohorts[] = (int) $cohort;
        }

        foreach ($rows as $row) {
            $cohort = filter_var($row, FILTER_VALIDATE_INT);
            if ($cohort !== false && !in_array($cohort, $cohorts, true)) {
                $cohorts[] = $cohort;
            }
        }

        return array_values(array_unique($cohorts));
    }

    public function getPublic() {
        $stmt = $this->pdo->query("SELECT id, full_name, title, cohort, status, avatar_data, profile_image_data,
            cv_link, portfolio_link, linkedin_link, github_link
            FROM trainees ORDER BY created_at DESC, id DESC");
        $rows = $stmt->fetchAll();
        return array_map(function ($row) {
            $name = preg_split('/\\s+/', trim($row['full_name']), 2);
            return [
                'id' => (int) $row['id'],
                'first' => $name[0] ?? '', 'last' => $name[1] ?? '',
                'role' => $row['title'], 'cohort' => (int) $row['cohort'], 'status' => $row['status'],
                'image' => $row['avatar_data'] ?: '', 'profileImage' => $row['profile_image_data'] ?: ($row['avatar_data'] ?: ''), 'cv' => $row['cv_link'] ?: '#',
                'portfolio' => $row['portfolio_link'] ?: '#', 'linkedin' => $row['linkedin_link'] ?: '#',
                'github' => $row['github_link'] ?: '#', 'email' => '#'
            ];
        }, $rows);
    }

    public function create($data) {
        $stmt = $this->pdo->prepare('INSERT INTO trainees
            (full_name, title, cohort, status, avatar_data, profile_image_data, cv_link, portfolio_link, linkedin_link, github_link)
            VALUES (:name, :title, :cohort, :status, :avatar, :profileImage, :cv, :portfolio, :linkedin, :github)');
        $stmt->execute($data);
        return (int) $this->pdo->lastInsertId();
    }

    public function update($id, $data) {
        $data['id'] = $id;
        $stmt = $this->pdo->prepare('UPDATE trainees SET full_name = :name, title = :title, cohort = :cohort,
            status = :status, avatar_data = :avatar, profile_image_data = :profileImage, cv_link = :cv, portfolio_link = :portfolio,
            linkedin_link = :linkedin, github_link = :github WHERE id = :id');
        $stmt->execute($data);
        return $stmt->rowCount() > 0;
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare('DELETE FROM trainees WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }
}
