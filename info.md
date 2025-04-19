php artisan migrate
php artisan migrate:rollback --step=1

# test
php artisan test --filter=TagTest

# php artisan make:cantroller PromptController
php artisan migrate:reset

  ⇂ migrate  
  ⇂ migrate:fresh
  ⇂ migrate:install
  ⇂ migrate:refresh
  ⇂ migrate:reset
  ⇂ migrate:rollback
  ⇂ migrate:status