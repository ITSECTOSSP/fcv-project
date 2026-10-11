<?php

namespace Database\Seeders;

use App\Models\Division;
use Illuminate\Database\Seeder;

class DivisionSeeder extends Seeder
{
    public function run(): void
    {
        $divisions = [
            [
                'id' => 1,
                'name' => 'Administrative Division',
            ],
            [
                'id' => 2,
                'name' => 'Journal and Minutes Division',
            ],
            [
                'id' => 3,
                'name' => 'Legislative Services Division',
            ],
        ];

        foreach ($divisions as $division) {
            Division::updateOrCreate(
                [
                    'id' => $division['id'],
                ],
                [
                    'name' => $division['name'],
                ],
            );
        }
    }
}