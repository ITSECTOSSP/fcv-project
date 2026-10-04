<?php

namespace Database\Seeders;

use App\Models\EquipmentType;
use Illuminate\Database\Seeder;

class EquipmentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $equipmentTypes = [
            [
                'name' => 'Desktop Computer',
                'description' => 'Desktop computer systems and workstations.',
            ],
            [
                'name' => 'Laptop',
                'description' => 'Portable laptop and notebook computers.',
            ],
            [
                'name' => 'Monitor',
                'description' => 'Computer monitors and display units.',
            ],
            [
                'name' => 'Printer',
                'description' => 'Printers and printing equipment.',
            ],
            [
                'name' => 'Scanner',
                'description' => 'Document scanners and scanning equipment.',
            ],
            [
                'name' => 'Photocopier',
                'description' => 'Photocopiers and multifunction office machines.',
            ],
            [
                'name' => 'Projector',
                'description' => 'Projectors and presentation display equipment.',
            ],
            [
                'name' => 'UPS',
                'description' => 'Uninterruptible power supply units.',
            ],
            [
                'name' => 'Network Equipment',
                'description' => 'Network switches, routers, access points, and related equipment.',
            ],
            [
                'name' => 'Server',
                'description' => 'Physical servers and server hardware.',
            ],
            [
                'name' => 'Tablet',
                'description' => 'Tablet computers and similar mobile computing devices.',
            ],
            [
                'name' => 'Mobile Device',
                'description' => 'Mobile phones and other mobile communication devices.',
            ],
            [
                'name' => 'Telephone',
                'description' => 'Office telephones and communication equipment.',
            ],
            [
                'name' => 'Audio/Visual Equipment',
                'description' => 'Audio, video, and presentation equipment.',
            ],
            [
                'name' => 'Other',
                'description' => 'Other office equipment not covered by the standard categories.',
            ],
        ];

        foreach ($equipmentTypes as $equipmentType) {
            EquipmentType::updateOrCreate(
                [
                    'name' => $equipmentType['name'],
                ],
                [
                    'description' => $equipmentType['description'],
                ]
            );
        }
    }
}