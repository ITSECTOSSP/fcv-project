<?php

namespace Database\Seeders;

use App\Models\Section;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $sections = [
            [
                'division_id' => 1,
                'name' => 'Records and Correspondence Section',
            ],
            [
                'division_id' => 1,
                'name' => 'Finance and Accounting Section',
            ],
            [
                'division_id' => 1,
                'name' => 'Personnel Section',
            ],
            [
                'division_id' => 1,
                'name' => 'Information Technology Section',
            ],
            [
                'division_id' => 1,
                'name' => 'General Service Section',
            ],
            [
                'division_id' => 2,
                'name' => 'Minutes Section',
            ],
            [
                'division_id' => 2,
                'name' => 'Committee Affairs Section',
            ],
            [
                'division_id' => 2,
                'name' => 'Journal and Transcription Section',
            ],
            [
                'division_id' => 2,
                'name' => 'Special Committee Section',
            ],
            [
                'division_id' => 3,
                'name' => 'Legislative Research Section',
            ],
            [
                'division_id' => 3,
                'name' => 'Agenda and Briefing Section',
            ],
            [
                'division_id' => 3,
                'name' => 'Ordinance and Resolution Section',
            ],
            [
                'division_id' => 3,
                'name' => 'Reference and Archives Section',
            ],
        ];

        foreach ($sections as $section) {
            Section::firstOrCreate(
                [
                    'division_id' => $section['division_id'],
                    'name' => $section['name'],
                ]
            );
        }
    }
}
