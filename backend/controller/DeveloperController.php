<?php

class DeveloperController {
    public function publicList() {
        echo json_encode([
            'success' => true,
            'developers' => [
                [
                    'id' => 'developer-1',
                    'first' => 'Developer',
                    'last' => 'One',
                    'role' => 'Full-Stack Developer',
                    'contribution' => 'Project architecture, backend integration and deployment.',
                    'image' => '/images/001.png',
                    'profileImage' => '/images/001.png',
                    'cv' => '#',
                    'portfolio' => '#',
                    'linkedin' => '#',
                    'github' => '#'
                ],
                [
                    'id' => 'developer-2',
                    'first' => 'Developer',
                    'last' => 'Two',
                    'role' => 'Frontend Developer',
                    'contribution' => 'Interface development, responsive layouts and interaction design.',
                    'image' => '/images/002.png',
                    'profileImage' => '/images/002.png',
                    'cv' => '#',
                    'portfolio' => '#',
                    'linkedin' => '#',
                    'github' => '#'
                ],
                [
                    'id' => 'developer-3',
                    'first' => 'Developer',
                    'last' => 'Three',
                    'role' => 'UI/UX Developer',
                    'contribution' => 'Visual direction, user experience and accessible page structure.',
                    'image' => '/images/003.png',
                    'profileImage' => '/images/003.png',
                    'cv' => '#',
                    'portfolio' => '#',
                    'linkedin' => '#',
                    'github' => '#'
                ],
                [
                    'id' => 'developer-4',
                    'first' => 'Developer',
                    'last' => 'Four',
                    'role' => 'Backend Developer',
                    'contribution' => 'Database design, API endpoints and application security.',
                    'image' => '/images/004.png',
                    'profileImage' => '/images/004.png',
                    'cv' => '#',
                    'portfolio' => '#',
                    'linkedin' => '#',
                    'github' => '#'
                ],
                [
                    'id' => 'developer-5',
                    'first' => 'Developer',
                    'last' => 'Five',
                    'role' => 'Product Developer',
                    'contribution' => 'Feature planning, testing and collaborative delivery.',
                    'image' => '/images/005.png',
                    'profileImage' => '/images/005.png',
                    'cv' => '#',
                    'portfolio' => '#',
                    'linkedin' => '#',
                    'github' => '#'
                ]
            ]
        ]);
    }
}
