<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('welcome');
    }

    // public function dashboard()
    public function dashboard(Request $request)
    {
        return Inertia::render('dashboard');
    }
}
