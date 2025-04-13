import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';

interface EditCategoryProps {
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    status: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Categories',
    href: '/admin/categories',
  },
];

export default function EditCategory({ category }: EditCategoryProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: category.name || '',
    slug: category.slug || '',
    description: category.description || '',
    status: category.status || 'active',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/categories/${category.id}`);
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Category" />
      <div className="flex items-center justify-between mb-4 px-4 pt-4">
        <h1 className="text-lg font-semibold">Edit Category</h1>
      </div>

      <form onSubmit={submit} className="px-4 py-4 space-y-4">
        {/* Name */}
        <div className="grid gap-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => {
              setData('name', e.target.value);
              setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
            }}
            disabled={processing}
            placeholder="Enter category name"
          />
          <InputError message={errors.name} className="mt-2" />
        </div>

        {/* Slug */}
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            type="text"
            value={data.slug}
            onChange={(e) => setData('slug', e.target.value)}
            disabled={processing}
            placeholder="Enter slug"
          />
          <InputError message={errors.slug} className="mt-2" />
        </div>

      

        {/* Status */}
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="status"
                value="active"
                checked={data.status === 'active'}
                onChange={() => setData('status', 'active')}
                disabled={processing}
                className="form-radio"
              />
              <span>Active</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="status"
                value="deactive"
                checked={data.status === 'deactive'}
                onChange={() => setData('status', 'deactive')}
                disabled={processing}
                className="form-radio"
              />
              <span>Inactive</span>
            </label>
          </div>
          <InputError message={errors.status} className="mt-2" />
        </div>

        {/* Submit */}
        <Button type="submit" disabled={processing}>
          Update Category
        </Button>
      </form>
    </AdminLayout>
  );
}
