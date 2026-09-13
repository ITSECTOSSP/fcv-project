<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ContentType;

class ContentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         $contentTypes = [
            [
                'name' => 'Announcement',
                'slug' => 'announcement',
                'description' => 'Official announcements and notices issued by the office.',
                'is_active' => true,
            ],
            [
                'name' => 'News',
                'slug' => 'news',
                'description' => 'News, updates, and notable activities of the office.',
                'is_active' => true,
            ],
            [
                'name' => 'Advisory',
                'slug' => 'advisory',
                'description' => 'Official advisories, reminders, and public guidance.',
                'is_active' => true,
            ],
            [
                'name' => 'Event',
                'slug' => 'event',
                'description' => 'Public events, meetings, hearings, and other scheduled activities.',
                'is_active' => true,
            ],
            [
                'name' => 'Public Information',
                'slug' => 'public-information',
                'description' => 'General information and resources intended for public access.',
                'is_active' => true,
            ],
            [
                'name' => 'FAQ',
                'slug' => 'faq',
                'description' => 'Frequently asked questions and their corresponding answers.',
                'is_active' => true,
            ],
        ];

        foreach ($contentTypes as $contentType) {
            ContentType::updateOrCreate(
                ['slug' => $contentType['slug']],
                $contentType
            );
        }
    }
}
