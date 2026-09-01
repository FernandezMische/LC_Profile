<?php

require_once __DIR__ . '/../config/database.php';

class DeveloperController {
    /** Return the five collaborators represented by trainee records 1–5. */
    public function publicList() {
        $pdo = getDBConnection();
        $stmt = $pdo->query("SELECT id, full_name, title, cohort, avatar_url, profile_image_url,
            cv_link, portfolio_link, linkedin_link, github_link
            FROM trainees
            WHERE id BETWEEN 1 AND 5
            ORDER BY id ASC");

        $developers = array_map(function ($row) {
            $name = preg_split('/\s+/', trim($row['full_name']), 2);
            $cohort = trim((string) $row['cohort']);
            $role = $row['title'] ?: 'Developer';

            $projectMap = [
                'Frontend Developer' => ['LC Studio Rebuild', 'Portfolio Experience', 'Client-facing Interface'],
                'Backend Developer' => ['Platform Architecture', 'API Delivery', 'Data Integration'],
                'UI/UX Designer' => ['Brand Direction', 'Experience Design', 'Digital Prototypes'],
                'Full-Stack Developer' => ['LC Studio Rebuild', 'System Build', 'Full Delivery Flow'],
                'Project Lead' => ['Team Coordination', 'Delivery Planning', 'Launch Support'],
            ];

            $projects = $projectMap[$role] ?? ['LC Studio Rebuild', 'Project Delivery', 'Collaborative Build'];

            return [
                'id' => (int) $row['id'],
                'first' => $name[0] ?? '',
                'last' => $name[1] ?? '',
                'role' => $role,
                'contribution' => $cohort !== '' ? "Cohort {$cohort}" : '',
                'projects' => $projects,
                'image' => cacheBustedImageUrl($row['avatar_url'] ?: ($row['profile_image_url'] ?: '')),
                'profileImage' => cacheBustedImageUrl($row['profile_image_url'] ?: ($row['avatar_url'] ?: '')),
                'cv' => $row['cv_link'] ?: '#',
                'portfolio' => $row['portfolio_link'] ?: '#',
                'linkedin' => $row['linkedin_link'] ?: '#',
                'github' => $row['github_link'] ?: '#'
            ];
        }, $stmt->fetchAll());

        echo json_encode([
            'success' => true,
            'developers' => $developers
        ]);
    }
}
