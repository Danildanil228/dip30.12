import { useState } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    loading?: boolean;
    searchPlaceholder?: string;
    searchColumn?: string;
    onRowClick?: (row: TData) => void;
    onDeleteSelected?: (selectedIds: number[]) => void;
    customToolbar?: React.ReactNode;
    showPagination?: boolean;
    showCheckboxes?: boolean;
}

export function DataTable<TData extends { id: number }>({
    columns,
    data,
    loading = false,
    searchPlaceholder = "Поиск...",
    onRowClick,
    onDeleteSelected,
    customToolbar,
    showPagination = true,
    showCheckboxes = true,
}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [showAll, setShowAll] = useState(false);

    const tableColumns = showCheckboxes
        ? [
              {
                  id: "select",
                  header: ({ table }: any) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
                  cell: ({ row }: any) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
                  enableSorting: false,
                  enableHiding: false,
              },
              ...columns,
          ]
        : columns;

    const table = useReactTable({
        data,
        columns: tableColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            pagination,
            globalFilter,
        },
    });

    const handleDeleteSelected = () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const selectedIds = selectedRows.map((row) => row.original.id);
        if (selectedIds.length > 0 && onDeleteSelected) {
            onDeleteSelected(selectedIds);
            setRowSelection({});
        }
    };

    const selectedCount = table.getFilteredSelectedRowModel().rows.length;

    const handleToggleShowAll = () => {
        if (showAll) {
            setPagination({ pageIndex: 0, pageSize: 10 });
        } else {
            setPagination({ pageIndex: 0, pageSize: data.length });
        }
        setShowAll(!showAll);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 py-4">
                <Input placeholder={searchPlaceholder} value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} className="max-w-sm bg-background! z-10" />

                {showCheckboxes && onDeleteSelected && selectedCount > 0 && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground bg-background z-10">Выбрано: {selectedCount}</span>
                        <Button variant="destructive" className="z-10" onClick={handleDeleteSelected}>
                            Удалить выбранные
                        </Button>
                    </div>
                )}

                {customToolbar && <div className="ml-auto">{customToolbar}</div>}
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table className="bg-background z-10">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow className="" key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={tableColumns.length} className="h-24 text-center bg-background z-10">
                                    Нет данных.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {showPagination && data.length > 0 && (
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-4">
                    <div className="text-sm text-muted-foreground bg-background z-10">Всего: {table.getFilteredRowModel().rows.length} записей</div>
                    <div className="flex items-center space-x-2">
                        {data.length > 10 && (
                            <Button variant="outline" onClick={handleToggleShowAll} className="z-10 bg-background!">
                                {showAll ? "Свернуть" : "Развернуть"}
                            </Button>
                        )}

                        {!showAll && table.getPageCount() > 1 && (
                            <div className="flex items-center space-x-2 bg-background z-10">
                                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                    {"<"}
                                </Button>
                                <span className="text-sm">
                                    Стр. {table.getState().pagination.pageIndex + 1} из {table.getPageCount()}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                    {">"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
