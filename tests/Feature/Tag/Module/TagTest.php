<?php

use App\Models\Admin;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create an admin user with the necessary role or permissions
    $this->admin = Admin::factory()->create();

    // Log the admin user in using the Auth facade
    Auth::login($this->admin);

    // Get the morph class for the Admin model
    $this->adminMorphClass = $this->admin->getMorphClass();
});

it("admin can create and view tags", function () {
    // Log in the admin explicitly for clarity (using 'admin' guard)
    Auth::guard('admin')->login($this->admin);

    // Create a tag for the logged-in admin user
    $tag = $this->admin->tags()->create([
        'slug' => 'test-tag',
        'name' => 'Test Tag',
        'description' => 'This is a test tag',
        'created_by_id' => $this->admin->id, // Use admin ID
        'created_by_type' => $this->adminMorphClass, // Use admin morph class
        'status' => Tag::STATUS_ACTIVE,
    ]);

    // Make a request to the tags index route
    $response = $this->get(route('admin.tags.index'));

    // Assert that the response is OK (200 status)
    $response->assertStatus(200);

    // Assert that the tag's name and slug are present in the response
    $response->assertSee($tag->name);
    $response->assertSee($tag->slug);
});

//update 
it("admin can update tags", function () {
    // Log in the admin explicitly for clarity (using 'admin' guard)
    Auth::guard('admin')->login($this->admin);

    // Create a tag for the logged-in admin user
    $tag = $this->admin->tags()->create([
        'slug' => 'test-tag',
        'name' => 'Test Tag',
        'description' => 'This is a test tag',
        'created_by_id' => $this->admin->id, // Use admin ID
        'created_by_type' => $this->adminMorphClass, // Use admin morph class
        'status' => Tag::STATUS_ACTIVE,
    ]);

    // Update the tag's name and slug
    $response = $this->put(route('admin.tags.update', $tag), [
        'name' => 'Updated Test Tag',
        'slug' => 'updated-test-tag',
        'description' => 'This is an updated test tag',
        'status' => Tag::STATUS_ACTIVE,
    ]);

    // Assert that the response is a redirect to the tags index route
    $response->assertRedirect(route('admin.tags.index'));

    // Assert that the tag was updated in the database
    $this->assertDatabaseHas('tags', [
        'id' => $tag->id,
        'name' => 'Updated Test Tag',
        'slug' => 'updated-test-tag',
        'description' => 'This is an updated test tag',
        'status' => Tag::STATUS_ACTIVE,
    ]);
});

//delete
it("admin can delete tags", function () {
    // Log in the admin explicitly for clarity (using 'admin' guard)
    Auth::guard('admin')->login($this->admin);

    // Create a tag for the logged-in admin user
    $tag = $this->admin->tags()->create([
        'slug' => 'test-tag',
        'name' => 'Test Tag',
        'description' => 'This is a test tag',
        'created_by_id' => $this->admin->id, // Use admin ID
        'created_by_type' => $this->adminMorphClass, // Use admin morph class
        'status' => Tag::STATUS_ACTIVE,
    ]);

    // Delete the tag
    $response = $this->delete(route('admin.tags.destroy', $tag));

    // Assert that the response is a redirect to the tags index route
    $response->assertRedirect(route('admin.tags.index'));

    // Assert that the tag was deleted from the database
    $this->assertDatabaseMissing('tags', [
        'id' => $tag->id,
        'name' => 'Test Tag',
        'slug' => 'test-tag',
        'description' => 'This is a test tag',
        'status' => Tag::STATUS_ACTIVE,
    ]);
});

//test if the tag is created by the admin
