"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { AdminProductRow, type AdminProduct } from "./AdminProductRow";

function SortableAdminProductRow({ product }: { product: AdminProduct }) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });
  const style: CSSProperties = {
    transform: transform
      ? `${CSS.Transform.toString(transform)}${isDragging ? " scale(1.02)" : ""}`
      : undefined,
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "relative z-10 rounded-2xl bg-white shadow-pop-lg" : "relative"}
    >
      <AdminProductRow
        product={product}
        dragHandle={
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            type="button"
            className="h-10 w-8 shrink-0 touch-none cursor-grab rounded-md text-2xl leading-none text-muted transition hover:bg-butter hover:text-ink active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            aria-label={`Drag to reorder ${product.name}`}
          >
            ⠿
          </button>
        }
      />
    </div>
  );
}

export function AdminProductList({ products: initialProducts }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id || saving) return;

    const oldIndex = products.findIndex(({ id }) => id === active.id);
    const newIndex = products.findIndex(({ id }) => id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = products;
    const next = arrayMove(products, oldIndex, newIndex);
    setProducts(next);
    setSaved(false);
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/admin/products/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map(({ id }) => id) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setProducts(previous);
        setError(data?.error ?? "Could not save product order.");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setProducts(previous);
      setError("Could not save product order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {products.length > 1 && (
        <p className="text-sm text-muted">
          Drag ⠿ to change the order products appear in the shop.
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm font-semibold text-leaf">
          Order saved
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm font-semibold text-berry">
          {error}
        </p>
      )}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={products.map(({ id }) => id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="card divide-y divide-ink/10">
            {products.length === 0 ? (
              <p className="p-6 text-sm text-muted">No products yet.</p>
            ) : (
              products.map((product) => (
                <SortableAdminProductRow
                  key={`${product.id}:${product.stock}`}
                  product={product}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
