<?php

namespace Database\Seeders;

use App\Models\AttachmentType;
use Illuminate\Database\Seeder;

class AttachmentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $attachmentTypes = [
            [
                'name' => 'Equipment Photo',
                'description' => 'Photographs of the equipment for identification and documentation.',
            ],
            [
                'name' => 'Property Document',
                'description' => 'Property and inventory documents associated with the equipment.',
            ],
            [
                'name' => 'Purchase Order',
                'description' => 'Purchase order or procurement document for the equipment.',
            ],
            [
                'name' => 'Official Receipt',
                'description' => 'Official receipt or proof of purchase.',
            ],
            [
                'name' => 'Invoice',
                'description' => 'Sales or purchase invoice associated with the equipment.',
            ],
            [
                'name' => 'Warranty',
                'description' => 'Warranty certificate or warranty-related document.',
            ],
            [
                'name' => 'Inspection Report',
                'description' => 'Inspection, assessment, or condition report.',
            ],
            [
                'name' => 'Delivery Receipt',
                'description' => 'Delivery receipt or document confirming receipt of the equipment.',
            ],
            [
                'name' => 'Acceptance Document',
                'description' => 'Document confirming acceptance or receipt of the equipment.',
            ],
            [
                'name' => 'Technical Document',
                'description' => 'Technical specifications, manuals, or related documentation.',
            ],
            [
                'name' => 'Other',
                'description' => 'Other supporting documents or files related to the equipment.',
            ],
        ];

        foreach ($attachmentTypes as $attachmentType) {
            AttachmentType::updateOrCreate(
                [
                    'name' => $attachmentType['name'],
                ],
                [
                    'description' => $attachmentType['description'],
                ]
            );
        }
    }
}