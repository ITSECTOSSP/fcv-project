<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ContentCategory;

class ContentCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Legislation',
                'slug' => 'legislation',
                'description' => 'Legislative measures, ordinances, resolutions, and related legislative information.',
                'is_active' => true,
            ],
            [
                'name' => 'Public Information',
                'slug' => 'public-information',
                'description' => 'General information and resources intended for public access.',
                'is_active' => true,
            ],
            [
                'name' => 'Public Service',
                'slug' => 'public-service',
                'description' => 'Information about government services, programs, and assistance available to the public.',
                'is_active' => true,
            ],
            [
                'name' => 'Events',
                'slug' => 'events',
                'description' => 'Government events, meetings, hearings, programs, and other activities.',
                'is_active' => true,
            ],
            [
                'name' => 'Health',
                'slug' => 'health',
                'description' => 'Public health information, programs, ordinances, and advisories.',
                'is_active' => true,
            ],
            [
                'name' => 'Environment',
                'slug' => 'environment',
                'description' => 'Environmental programs, policies, initiatives, and related information.',
                'is_active' => true,
            ],
            [
                'name' => 'Citizen Services',
                'slug' => 'citizen-services',
                'description' => 'Information and resources related to services available to citizens and constituents.',
                'is_active' => true,
            ],
            [
                'name' => 'Government',
                'slug' => 'government',
                'description' => 'Government offices, policies, programs, initiatives, and official activities.',
                'is_active' => true,
            ],
            [
                'name' => 'Community',
                'slug' => 'community',
                'description' => 'Community activities, initiatives, programs, and public engagement.',
                'is_active' => true,
            ],
            [
                'name' => 'Announcements',
                'slug' => 'announcements',
                'description' => 'Important public notices, announcements, and updates.',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            ContentCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
