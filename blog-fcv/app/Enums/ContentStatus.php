<?php

namespace App\Enums;

enum ContentStatus: string
{
    case DRAFT = 'draft';
    case PENDING = 'pending';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::PENDING => 'Pending',
            self::PUBLISHED => 'Published',
            self::ARCHIVED => 'Archived',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::DRAFT => 'Content is being prepared and is not publicly visible.',
            self::PENDING => 'Content is waiting for review or approval.',
            self::PUBLISHED => 'Content is publicly available.',
            self::ARCHIVED => 'Content is no longer actively published.',
        };
    }

    public function isPublic(): bool
    {
        return $this === self::PUBLISHED;
    }
}