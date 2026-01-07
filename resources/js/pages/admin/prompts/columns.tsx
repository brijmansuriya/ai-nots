import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { router } from "@inertiajs/react"
import DeleteButton from "@/components/delete-button"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "category.name",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return category ? category.name : 'N/A';
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusMap: Record<string, { label: string; className: string }> = {
        '0': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
        '1': { label: 'Active', className: 'bg-green-100 text-green-800' },
        '2': { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      };
      const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) =>
      new Date(row.getValue("created_at")).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.visit(route('admin.prompts.show', row.original.id))}>
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.visit(route('admin.prompts.edit', row.original.id))}>
            Edit
          </DropdownMenuItem>
          <DeleteButton id={row.original.id} routeName="admin.prompts.destroy" />
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]


