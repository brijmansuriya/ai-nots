<?php

namespace App\Console\Commands;

use App\Models\Admin;
use Illuminate\Console\Command;

class FixAdminPassword extends Command
{
    protected $signature = 'admin:fix-password {email=admin@system.com} {password=password}';
    protected $description = 'Fix admin password that may have been double-hashed';

    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        $admin = Admin::where('email', $email)->first();

        if (!$admin) {
            $this->error("Admin with email {$email} not found!");
            return 1;
        }

        // Set password directly - the 'hashed' cast will handle hashing
        $admin->password = $password;
        $admin->save();

        $this->info("Admin password reset successfully!");
        $this->info("Email: {$email}");
        $this->info("Password: {$password}");

        return 0;
    }
}

