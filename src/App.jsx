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
  Calendar,
  Edit2,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Eye,
  Shield,
  Activity
} from "lucide-react";

export default function App() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [nama, setNama] = useState("");
  const [umur, setUmur] = useState("");
  const [alamat, setAlamat] = useState("");
  const [email, setEmail] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterAge, setFilterAge] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [sortBy, setSortBy] = useState("name");

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
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ======== Filter and Search ========
  useEffect(() => {
    let result = [...users];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.nama.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.alamat.toLowerCase().includes(term)
      );
    }

    // Age filter
    if (filterAge !== "all") {
      const age = parseInt(filterAge);
      result = result.filter(user => {
        if (filterAge === "under20") return user.umur < 20;
        if (filterAge === "20-40") return user.umur >= 20 && user.umur <= 40;
        if (filterAge === "over40") return user.umur > 40;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "name") return a.nama.localeCompare(b.nama);
      if (sortBy === "age-asc") return a.umur - b.umur;
      if (sortBy === "age-desc") return b.umur - a.umur;
      return 0;
    });

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, searchTerm, filterAge, sortBy]);

  // ======== Pagination ========
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // ======== Handle Submit ========
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama.trim() || !umur || !alamat.trim()) {
      alert("Nama, umur, dan alamat harus diisi!");
      return;
    }

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
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      fetchUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
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

  // ======== Get Age Color ========
  const getAgeColor = (age) => {
    if (age < 20) return "bg-blue-100 text-blue-800";
    if (age <= 40) return "bg-green-100 text-green-800";
    return "bg-purple-100 text-purple-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-8">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <Trash className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
              Hapus User
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Apakah Anda yakin ingin menghapus <span className="font-semibold">{userToDelete?.nama}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash size={18} />
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <Shield className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                    User Management
                  </h1>
                  <p className="text-gray-600 mt-2 flex items-center gap-2">
                    <Activity size={16} />
                    Sistem Pengelolaan Data Pengguna
                  </p>
                </div>
              </div>
            </div>
            
            {!formVisible && !editingId && (
              <button
                onClick={() => setFormVisible(true)}
                className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Tambah User Baru</span>
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <User className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Under 20</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {users.filter(u => u.umur < 20).length}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Calendar className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">With Email</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {users.filter(u => u.email).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Mail className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Now</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {currentUsers.length}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Activity className="text-orange-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            {(formVisible || editingId) && (
              <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl p-6 mb-8 sticky top-8 border border-gray-200">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingId ? "Edit User" : "Tambah User Baru"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {editingId ? "Update data user yang ada" : "Tambahkan user baru ke sistem"}
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X size={22} className="text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nama Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <User size={18} />
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required
                    />
                  </div>

                  {/* Umur Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calendar size={18} />
                      Umur *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="Masukkan umur"
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      value={umur}
                      onChange={(e) => setUmur(e.target.value)}
                      required
                    />
                  </div>

                  {/* Alamat Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <MapPin size={18} />
                      Alamat *
                    </label>
                    <textarea
                      placeholder="Masukkan alamat lengkap"
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none"
                      rows="3"
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Mail size={18} />
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* No Telepon Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Phone size={18} />
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      placeholder="0812-3456-7890"
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      value={noTelepon}
                      onChange={(e) => setNoTelepon(e.target.value)}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Memproses...
                        </>
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
                        className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-sm"
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
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Table Header */}
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Daftar Users
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Total {filteredUsers.length} user ditemukan
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={fetchUsers}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors duration-200"
                    >
                      <RefreshCw size={18} />
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Cari nama, email, atau alamat..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Age Filter */}
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm appearance-none"
                      value={filterAge}
                      onChange={(e) => setFilterAge(e.target.value)}
                    >
                      <option value="all">Semua Umur</option>
                      <option value="under20">Dibawah 20 Tahun</option>
                      <option value="20-40">20 - 40 Tahun</option>
                      <option value="over40">Diatas 40 Tahun</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm appearance-none"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="name">Urutkan Nama (A-Z)</option>
                      <option value="age-asc">Umur (Muda-Tua)</option>
                      <option value="age-desc">Umur (Tua-Muda)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
                    <p className="text-gray-600">Memuat data...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl mb-6">
                      <User size={40} className="text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Data Tidak Ditemukan
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                      {searchTerm || filterAge !== "all" 
                        ? "Tidak ada user yang sesuai dengan filter pencarian."
                        : "Belum ada data user yang tersimpan."}
                    </p>
                    {!formVisible && !editingId && (
                      <button
                        onClick={() => setFormVisible(true)}
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Plus size={22} />
                        Tambah User Pertama
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-white">
                        <tr>
                          <th className="px-8 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            User Profile
                          </th>
                          <th className="px-8 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Age
                          </th>
                          <th className="px-8 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Contact Info
                          </th>
                          <th className="px-8 py-5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentUsers.map((user) => (
                          <tr 
                            key={user.id} 
                            className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-white transition-all duration-300 group"
                          >
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="flex-shrink-0 h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                                    <User size={24} className="text-white" />
                                  </div>
                                  {user.email && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                      <Mail size={10} className="text-white" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {user.nama}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <MapPin size={14} />
                                    {user.alamat.substring(0, 40)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getAgeColor(user.umur)} font-semibold text-sm`}>
                                <Calendar size={14} />
                                {user.umur} Tahun
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="space-y-2">
                                {user.email && (
                                  <div className="flex items-center gap-3 group/email">
                                    <div className="p-2 bg-blue-50 rounded-lg group-hover/email:bg-blue-100 transition-colors">
                                      <Mail size={16} className="text-blue-600" />
                                    </div>
                                    <span className="text-gray-700 group-hover/email:text-blue-600 transition-colors">
                                      {user.email}
                                    </span>
                                  </div>
                                )}
                                {user.noTelepon && (
                                  <div className="flex items-center gap-3 group/phone">
                                    <div className="p-2 bg-green-50 rounded-lg group-hover/phone:bg-green-100 transition-colors">
                                      <Phone size={16} className="text-green-600" />
                                    </div>
                                    <span className="text-gray-700 group-hover/phone:text-green-600 transition-colors">
                                      {user.noTelepon}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleEdit(user)}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group/edit"
                                >
                                  <Edit2 size={16} className="group-hover/edit:rotate-12 transition-transform" />
                                  <span className="font-medium">Edit</span>
                                </button>
                                <button
                                  onClick={() => confirmDelete(user)}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group/delete"
                                >
                                  <Trash size={16} className="group-hover/delete:shake" />
                                  <span className="font-medium">Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="px-8 py-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="text-sm text-gray-600">
                            Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} dari {filteredUsers.length} user
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                              <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                                  currentPage === i + 1
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-700 font-medium">
                © Ilham Saputra
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Dibuat oleh Ilham
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                v1.0.0 • React + Firebase
              </span>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .group-hover\\/delete:shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
