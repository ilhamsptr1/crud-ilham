import React, { useState, useEffect } from "react";
import { db } from "./firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  Trash,
  Plus,
  Check,
  X,
  Mail,
  Phone,
  User,
  MapPin,
  Calendar
} from "lucide-react";

export default function App() {
  const [users, setUsers] = useState([]);
  const [nama, setNama] = useState("");
  const [umur, setUmur] = useState("");
  const [alamat, setAlamat] = useState("");
  const [email, setEmail] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  const usersCollection = collection(db, "users");

  // ======== Fetch Data Firebase ========
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getDocs(usersCollection);
      const usersData = data.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ======== Handle Submit ========
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama.trim() || !umur || !alamat.trim()) {
      alert("Nama, umur, dan alamat harus diisi!");
      return;
    }

    // Validasi email
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      alert("Format email tidak valid!");
      return;
    }

    const userData = {
      nama: nama.trim(),
      umur: Number(umur),
      alamat: alamat.trim(),
      email: email.trim() || null,
      noTelepon: noTelepon.trim() || null,
      updatedAt: new Date().toISOString(),
    };

    setLoading(true);

    try {
      if (editingId) {
        const docRef = doc(db, "users", editingId);
        await updateDoc(docRef, userData);
        setEditingId(null);
      } else {
        await addDoc(usersCollection, {
          ...userData,
          createdAt: new Date().toISOString()
        });
      }

      resetForm();
      fetchUsers();
      setFormVisible(false);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Terjadi kesalahan saat menyimpan data!");
    }

    setLoading(false);
  };

  // ======== Reset Form ========
  const resetForm = () => {
    setNama("");
    setUmur("");
    setAlamat("");
    setEmail("");
    setNoTelepon("");
    setEditingId(null);
  };

  // ======== Delete Data ========
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Gagal menghapus data!");
    }
  };

  // ======== Edit Data ========
  const handleEdit = (user) => {
    setNama(user.nama);
    setUmur(user.umur.toString());
    setAlamat(user.alamat);
    setEmail(user.email || "");
    setNoTelepon(user.noTelepon || "");
    setEditingId(user.id);
    setFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ======== Cancel Edit ========
  const handleCancel = () => {
    resetForm();
    setFormVisible(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                User Management
              </h1>
              <p className="text-gray-600 mt-2">
                Kelola data pengguna dengan Firebase Firestore
              </p>
            </div>
            
            {!formVisible && !editingId && (
              <button
                onClick={() => setFormVisible(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                Tambah User Baru
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            {(formVisible || editingId) && (
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 sticky top-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingId ? "Edit User" : "Tambah User Baru"}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nama Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User size={16} />
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required
                    />
                  </div>

                  {/* Umur Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} />
                      Umur *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="Masukkan umur"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={umur}
                      onChange={(e) => setUmur(e.target.value)}
                      required
                    />
                  </div>

                  {/* Alamat Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} />
                      Alamat *
                    </label>
                    <textarea
                      placeholder="Masukkan alamat lengkap"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows="3"
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Masukkan alamat email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* No Telepon Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} />
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      placeholder="Masukkan nomor telepon"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={noTelepon}
                      onChange={(e) => setNoTelepon(e.target.value)}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        "Memproses..."
                      ) : (
                        <>
                          <Check size={20} />
                          {editingId ? "Update Data" : "Simpan Data"}
                        </>
                      )}
                    </button>
                    
                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                      >
                        <X size={20} />
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Table Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Daftar Users
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Total {users.length} user terdaftar
                    </p>
                  </div>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <User size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Belum ada data user
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Mulai dengan menambahkan user baru
                    </p>
                    {!formVisible && (
                      <button
                        onClick={() => setFormVisible(true)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                      >
                        <Plus size={20} />
                        Tambah User Pertama
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Umur
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Kontak
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr 
                          key={user.id} 
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User size={20} className="text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {user.nama}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.alamat.substring(0, 30)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                              {user.umur} tahun
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {user.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail size={14} className="text-gray-500" />
                                  <span className="text-gray-700">{user.email}</span>
                                </div>
                              )}
                              {user.noTelepon && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone size={14} className="text-gray-500" />
                                  <span className="text-gray-700">{user.noTelepon}</span>
                                </div>
                              )}
                              {!user.email && !user.noTelepon && (
                                <span className="text-gray-400 text-sm">Tidak ada kontak</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition-colors font-medium text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors font-medium text-sm"
                              >
                                <Trash size={16} />
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Table Footer */}
              {users.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div>
                      Menampilkan <span className="font-semibold">{users.length}</span> user
                    </div>
                    <div>
                      <button
                        onClick={fetchUsers}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                      >
                        Refresh Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 User Management System. Dibuat Oleh Ilham</p>
        </footer>
      </div>
    </div>
  );
}