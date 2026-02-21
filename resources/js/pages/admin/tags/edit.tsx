import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';

interface EditTagProps {
  tag: {
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
    href: '/admin/dashboard',
  },
  {
    title: 'Tags',
    href: '/admin/tags',
  },
];

export default function EditTag({ tag }: EditTagProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: tag.name || '',
    slug: tag.slug || '',
    description: tag.description || '',
    status: tag.status || '1',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/tags/${tag.id}`);
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Tag" />
      <div className="flex items-center justify-between mb-4 px-4 pt-4">
        <h1 className="text-lg font-semibold text-foreground">Edit Tag</h1>
      </div>

      <form onSubmit={submit} className="px-4 py-4 space-y-4">
        {/* Name */}
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-foreground">Tag Name</Label>
          <Input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => {
              setData('name', e.target.value);
              setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
            }}
            disabled={processing}
            placeholder="Enter tag name"
          />
          <InputError message={errors.name} className="mt-2" />
        </div>

        {/* Slug */}
        <div className="grid gap-2">
          <Label htmlFor="slug" className="text-foreground">Slug</Label>
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

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="description" className="text-foreground">Description</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            disabled={processing}
            placeholder="Type your message here"
          />
          <InputError message={errors.description} className="mt-2 text-red-600" />
        </div>

        {/* Status */}
        <div className="grid gap-2">
          <Label htmlFor="status" className="text-foreground">Status</Label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="1"
                checked={data.status === '1'}
                onChange={() => setData('status', '1')}
                disabled={processing}
                className="form-radio text-foreground"
              />
              <span className="text-foreground">Active</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="2"
                checked={data.status === '2'}
                onChange={() => setData('status', '2')}
                disabled={processing}
                className="form-radio text-foreground"
              />
              <span className="text-foreground">Inactive</span>
            </label>
          </div>
          <InputError message={errors.status} className="mt-2" />
        </div>

        {/* Submit */}
        <Button type="submit" disabled={processing}>
          Update Tag
        </Button>
      </form>
    </AdminLayout>
  );
}
