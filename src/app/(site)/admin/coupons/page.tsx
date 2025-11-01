"use client";

import { useState, useEffect } from "react";

type Coupon = {
  _id: string;
  code: string;
  discountAmount: number;
  minAmount: number;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
};

type FormState = {
  code: string;
  discountAmount: string;
  minAmount: string;
  expiresAt: string;
  maxUses: string;
};

const initForm: FormState = {
  code: "",
  discountAmount: "",
  minAmount: "",
  expiresAt: "",
  maxUses: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<FormState>(initForm);
  const [editingCode, setEditingCode] = useState<string | null>(null);

  async function fetchCoupons() {
    setLoading(true);
    const res = await fetch("/api/coupons");
    const data = await res.json();
    setCoupons(data?.data?.items || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function createCoupon() {
    await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        discountAmount: Number(form.discountAmount),
        minAmount: Number(form.minAmount),
        maxUses: Number(form.maxUses),
      }),
    });

    closeModal();
    fetchCoupons();
  }

  async function openEdit(c: Coupon) {
    setEditMode(true);
    setEditingCode(c.code);
    setForm({
      code: c.code,
      discountAmount: String(c.discountAmount),
      minAmount: String(c.minAmount),
      expiresAt: c.expiresAt.split("T")[0],
      maxUses: String(c.maxUses),
    });
    setIsModalOpen(true);
  }

  async function updateCoupon() {
    if (!editingCode) return;

    await fetch(`/api/coupons/${editingCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        discountAmount: Number(form.discountAmount),
        minAmount: Number(form.minAmount),
        maxUses: Number(form.maxUses),
        expiresAt: form.expiresAt,
      }),
    });

    closeModal();
    fetchCoupons();
  }

  async function deleteCoupon(code: string) {
    if (!confirm(`Delete coupon ${code}?`)) return;

    await fetch(`/api/coupons/${code}`, {
      method: "DELETE",
    });

    fetchCoupons();
  }

  function handleChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditMode(false);
    setEditingCode(null);
    setForm(initForm);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold mb-4">Coupons</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Coupon
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-[400px]">
            <h2 className="text-lg font-semibold mb-3">
              {editMode ? "Edit Coupon" : "Create Coupon"}
            </h2>

            {(Object.keys(form) as (keyof FormState)[]).map((key) => (
              <input
                key={key}
                placeholder={key}
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="border p-2 rounded w-full mb-2"
                type={key === "expiresAt" ? "date" : "text"}
              />
            ))}

            <button
              className="bg-blue-600 text-white w-full py-2 rounded mt-2"
              onClick={editMode ? updateCoupon : createCoupon}
            >
              {editMode ? "Update" : "Save"}
            </button>

            <button
              className="bg-gray-300 w-full py-2 rounded mt-2"
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          {coupons.map((c) => (
            <div key={c._id} className="border rounded p-4 shadow-sm">
              <p>
                <b>Code:</b> {c.code}
              </p>
              <p>
                <b>Discount:</b> ₹{c.discountAmount}
              </p>
              <p>
                <b>Min:</b> ₹{c.minAmount}
              </p>
              <p>
                <b>Expires:</b> {new Date(c.expiresAt).toLocaleDateString()}
              </p>
              <p>
                <b>Used:</b> {c.usedCount}/{c.maxUses}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => openEdit(c)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => deleteCoupon(c.code)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
