<?php

namespace App\Enums;

enum PromptStatus: string
{
    case PENDING = '0';
    case ACTIVE = '1';
    case REJECTED = '2';

    /**
     * Get all status values as array
     *
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get status label
     *
     * @return string
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::ACTIVE => 'Active',
            self::REJECTED => 'Rejected',
        };
    }
}

