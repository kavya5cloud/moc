
import React, { useState, useEffect, useCallback } from 'react';
import { 
    Lock, LogOut, Trash, Plus, ShoppingBag, 
    Check, X, Database, Calendar, CreditCard, 
    TrendingUp, Package, Users, RefreshCw, ChevronRight,
    Tag, Activity, Globe, ShieldCheck, AlertCircle, Copy, Terminal,
    Upload, Image as ImageIcon, Link as LinkIcon, Info, WifiOff
} from 'lucide-react';
import { 
    getCollectables, deleteCollectable, saveCollectable,
    getBookings, getShopOrders, updateOrderStatus,
    getDashboardAnalytics, checkDatabaseConnection
} from '../services/data';
import { Collectable, Booking, ShopOrder } from '../types';

type Tab = 'analytics' | 'orders' | 'bookings' | 'inventory' | 'system';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inventory, setInventory] = useState<Collectable[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
 const refreshDbStatus = useCallback(() => {
  const status = checkDatabaseConnection();
  setDbStatus(status);
}, []);

useEffect(() => {
  if (!isAuthenticated) return;

  refreshDbStatus();
  fetchAdminData();

  const interval = setInterval(() => {
    fetchAdminData();
    refreshDbStatus();
  }, 10000); // refresh DB status every 10s

  return () => clearInterval(interval);
}, [isAuthenticated, refreshDbStatus]);


  const fetchAdminData = async () => {
      setLoading(true);
      try {
          const [stats, ord, bks, inv] = await Promise.all([
              getDashboardAnalytics(), getShopOrders(), getBookings(), getCollectables()
          ]);
          setAnalytics(stats);
          setOrders(ord);
          setBookings(bks);
          setInventory(inv);
      } catch (error) {
          console.error("Failed to fetch admin data:", error);
          // Optionally, show an error message to the user
      } finally {
          setLoading(false);
      }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
        setIsAuthenticated(true);
        localStorage.setItem('MOCA_STAFF_MODE', 'true');
    } else alert('Access Denied.');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('MOCA_STAFF_MODE');
  };

  const toggleOrderStatus = async (id: string, current: string) => {
      const next = current === 'Pending' ? 'Fulfilled' : 'Pending';
      await updateOrderStatus(id, next);
      fetchAdminData();
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSyncing(true);
      await saveCollectable(editItem);
      setEditItem(null);
      fetchAdminData();
      setIsSyncing(false);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Please upload an image file.");
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        setEditItem({ ...editItem, imageUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
    }
  }, [editItem]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
  };

  const sqlSchema = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS collectables (id TEXT PRIMARY KEY, name TEXT, price NUMERIC, category TEXT, imageUrl TEXT, description TEXT, inStock BOOLEAN, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
CREATE TABLE IF NOT EXISTS exhibitions (id TEXT PRIMARY KEY, title TEXT, dateRange TEXT, description TEXT, imageUrl TEXT, category TEXT);
CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, customerName TEXT, email TEXT, date TEXT, tickets JSONB, totalAmount NUMERIC, timestamp BIGINT, status TEXT);
CREATE TABLE IF NOT EXISTS shop_orders (id TEXT PRIMARY KEY, customerName TEXT, email TEXT, items JSONB, totalAmount NUMERIC, timestamp BIGINT, status TEXT);
CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, itemId TEXT, itemType TEXT, userName TEXT, rating INTEGER, comment TEXT, timestamp BIGINT);`;

  const copySql = () => {
      navigator.clipboard.writeText(sqlSchema);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-6">
         <div className="bg-white max-w-sm w-full p-10 rounded-3xl text-center shadow-xl border border-gray-100">
             <div className="bg-black w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                 <Lock className="text-white w-8 h-8" />
             </div>
             <h1 className="text-2xl font-black mb-2 tracking-tighter uppercase">Admin Access</h1>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-10">MOCA Security Gate</p>
             <form onSubmit={handleLogin} className="space-y-4">
                 <input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-center font-black text-2xl outline-none focus:border-black transition-all" placeholder="••••" />
                 <button type="submit" className="w-full bg-black text-white font-black py-4 rounded-xl uppercase tracking-widest hover:bg-gray-800 transition-colors">Authorize</button>
             </form>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans">
       {/* Sidebar */}
       <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
           <div className="p-8 border-b border-gray-50">
               <h1 className="text-xl font-black tracking-tighter">MOCA CORE</h1>
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Management Hub</p>
           </div>
           
           <nav className="flex-grow p-6 space-y-2">
               {[
                   { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
                   { id: 'orders', icon: ShoppingBag, label: 'Shop Orders' },
                   { id: 'bookings', icon: Calendar, label: 'Ticket Registry' },
                   { id: 'inventory', icon: Tag, label: 'Products' },
                   { id: 'system', icon: Database, label: 'System' },
               ].map(item => (
                   <button 
                       key={item.id} 
                       onClick={() => setActiveTab(item.id as Tab)}
                       className={`w-full flex items-center gap-4 p-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === item.id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
                   >
                       <item.icon className="w-4 h-4" />
                       {item.label}
                   </button>
               ))}
           </nav>

           <div className="p-6 border-t border-gray-50">
               <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-xl text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-all">
                   <LogOut className="w-4 h-4" /> Sign Out
               </button>
           </div>
       </aside>

       {/* Main Content */}
       <main className="flex-grow p-10 max-h-screen overflow-y-auto">
           {loading && !analytics ? (
               <div className="h-full flex flex-col items-center justify-center animate-pulse">
                   <RefreshCw className="w-10 h-10 text-gray-200 animate-spin mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Synchronizing with Server...</p>
               </div>
           ) : (
               <div className="max-w-6xl mx-auto space-y-10">
                   {/* Local Storage Warning Banner */}
                   {dbStatus && !dbStatus.isConnected && (

                       <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                           <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                               <WifiOff className="w-6 h-6" />
                           </div>
                           <div className="flex-grow">
                               <h4 className="text-sm font-black uppercase tracking-widest text-amber-900 mb-1">Local Mirror Mode Active</h4>
                               <p className="text-xs text-amber-700 leading-relaxed mb-4">
                                   Your changes are currently saved <b>only on this device</b>. To sync your products and orders to your phone or other staff members, you must connect a Supabase database.
                               </p>
                               <button 
                                onClick={() => setActiveTab('system')}
                                className="text-[10px] font-black uppercase tracking-widest bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors"
                               >
                                   Fix Connectivity
                               </button>
                           </div>
                       </div>
                   )}

                   {/* Header Row */}
                   <div className="flex justify-between items-end">
                       <div>
                           <h2 className="text-4xl font-black tracking-tighter uppercase">{activeTab}</h2>
                           <p className="text-sm text-gray-400">Live operational data from the MOCA servers.</p>
                       </div>
                       <div className="flex items-center gap-4">
                           <button onClick={fetchAdminData} className="p-2 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all"><RefreshCw className="w-4 h-4" /></button>
                           {activeTab === 'inventory' && (
                               <button onClick={() => setEditItem({ id: `item-${Date.now()}`, name: '', price: 0, category: 'Accessories', description: '', imageUrl: '', inStock: true })} className="bg-black text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase flex items-center gap-2 hover:bg-gray-800">
                                   <Plus className="w-4 h-4" /> Add Product
                               </button>
                           )}
                       </div>
                   </div>

                   {activeTab === 'system' && (
                       <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Globe className="w-6 h-6" /> Supabase Connection</h3>
                                
                                <div className="grid md:grid-cols-2 gap-8 mb-12">
                                    <div className={`p-8 rounded-3xl border ${dbStatus?.isConnected ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Status</span>
                                            {dbStatus?.isConnected ? <Check className="text-green-600 w-5 h-5" /> : <AlertCircle className="text-amber-600 w-5 h-5" />}
                                        </div>
                                        <div className="text-2xl font-black mb-2">{dbStatus?.mode}</div>
                                        <p className="text-xs text-gray-500 leading-relaxed mb-6">
                                            {dbStatus?.isConnected 
                                              ? 'Your museum is connected to Supabase Cloud. All changes are synchronized globally.'
                                              : 'The app is running in Local Mirror mode. All data is stored in the browser. To go live, provide SUPABASE_URL in your environment.'}
                                        </p>
                                        <div className="text-[9px] font-mono text-gray-400 break-all bg-white/50 p-2 rounded">
                                            ENDPOINT: {dbStatus?.url}
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-3xl border bg-gray-50 border-gray-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cross-Device Sync</span>
                                            <ShieldCheck className="text-blue-600 w-5 h-5" />
                                        </div>
                                        <div className="text-2xl font-black mb-2">HYBRID LINK</div>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            To see updates on your phone, you must provide your Supabase keys. Once connected, your browser will upload its local data to the cloud automatically.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            <Terminal className="w-4 h-4" /> Initial Database Schema
                                        </h4>
                                        <button 
                                            onClick={copySql}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-gray-100 hover:bg-black hover:text-white px-3 py-1.5 rounded-lg transition-all"
                                        >
                                            {copyFeedback ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copyFeedback ? 'Copied' : 'Copy SQL'}
                                        </button>
                                    </div>
                                    <pre className="bg-black text-green-400 p-6 rounded-2xl text-[10px] font-mono overflow-x-auto border-4 border-gray-900 leading-relaxed">
                                        {sqlSchema}
                                    </pre>
                                    <p className="text-[10px] text-gray-400 italic">Paste this into the Supabase SQL Editor to prepare your tables.</p>
                                </div>
                            </div>
                       </div>
                   )}

                   {activeTab === 'analytics' && (
                       <div className="space-y-10">
                           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                               {[
                                   { label: 'Total Revenue', value: `₹${analytics.totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-green-600' },
                                   { label: 'Total Tickets', value: analytics.totalTickets, icon: Users, color: 'text-blue-600' },
                                   { label: 'Shop Orders', value: analytics.orderCount, icon: Package, color: 'text-orange-600' },
                                   { label: 'Cloud Status', value: dbStatus?.isConnected ? 'Connected' : 'Local Only', icon: Activity, color: dbStatus?.isConnected ? 'text-purple-600' : 'text-amber-500' },
                               ].map((stat, i) => (
                                   <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                       <div className="flex items-center gap-4 mb-4">
                                           <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</span>
                                       </div>
                                       <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
                                   </div>
                               ))}
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                   <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Activity className="w-4 h-4" /> Recent Transactions</h3>
                                   <div className="space-y-4">
                                       {analytics.recentActivity.map((act: any, idx: number) => (
                                           <div key={idx} className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-colors">
                                               <div className="flex items-center gap-4">
                                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${act.totalAmount > 0 ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                                       {act.items ? <ShoppingBag className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                                                   </div>
                                                   <div>
                                                       <p className="text-xs font-bold">{act.customerName || 'Guest'}</p>
                                                       <p className="text-[9px] text-gray-400 font-mono">{new Date(act.timestamp).toLocaleTimeString()}</p>
                                                   </div>
                                               </div>
                                               <div className="text-right">
                                                   <p className="text-xs font-black">₹{act.totalAmount.toLocaleString()}</p>
                                                   <p className="text-[8px] font-bold uppercase text-gray-400">{act.id}</p>
                                               </div>
                                           </div>
                                       ))}
                                       {analytics.recentActivity.length === 0 && (
                                           <div className="py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No Recent Activity</div>
                                       )}
                                   </div>
                               </div>
                           </div>
                       </div>
                   )}

                   {activeTab === 'orders' && (
                       <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden">
                           <table className="w-full text-left">
                               <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                                   <tr>
                                       <th className="p-6">Order ID</th>
                                       <th className="p-6">Customer</th>
                                       <th className="p-6">Total</th>
                                       <th className="p-6">Status</th>
                                       <th className="p-6 text-right">Actions</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-gray-50">
                                   {orders.map(order => (
                                       <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                           <td className="p-6 font-mono text-[10px] font-bold">{order.id}</td>
                                           <td className="p-6">
                                               <p className="text-sm font-bold">{order.customerName}</p>
                                               <p className="text-[10px] text-gray-400">{order.email}</p>
                                           </td>
                                           <td className="p-6 font-black">₹{order.totalAmount.toLocaleString()}</td>
                                           <td className="p-6">
                                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'Fulfilled' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                   {order.status}
                                               </span>
                                           </td>
                                           <td className="p-6 text-right">
                                               <button 
                                                   onClick={() => toggleOrderStatus(order.id, order.status)}
                                                   className="text-xs font-bold uppercase text-gray-400 hover:text-black transition-colors"
                                               >
                                                   Toggle Status
                                               </button>
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       </div>
                   )}

                   {activeTab === 'inventory' && (
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           {inventory.map(item => (
                               <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm group">
                                   <div className="h-48 bg-gray-50 relative overflow-hidden">
                                       <img src={item.imageUrl} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                                       <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                           {item.category}
                                       </div>
                                   </div>
                                   <div className="p-6">
                                       <div className="flex justify-between items-start mb-4">
                                           <div>
                                               <h4 className="font-bold text-lg mb-1">{item.name}</h4>
                                               <p className="text-sm text-gray-400">₹{item.price.toLocaleString()}</p>
                                           </div>
                                           <span className={`w-3 h-3 rounded-full ${item.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                                       </div>
                                       <div className="flex gap-2">
                                           <button onClick={() => setEditItem(item)} className="flex-grow bg-gray-50 py-3 rounded-xl text-xs font-black uppercase hover:bg-black hover:text-white transition-all">Edit</button>
                                           <button onClick={() => deleteCollectable(item.id).then(fetchAdminData)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash className="w-4 h-4" /></button>
                                       </div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
               </div>
           )}
       </main>

       {/* Edit Modal */}
       {editItem && (
           <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto">
               <div className="bg-white max-w-lg w-full rounded-[2.5rem] p-10 md:p-12 animate-in zoom-in-95 duration-300 my-8">
                   <div className="flex justify-between items-center mb-10">
                       <h3 className="text-2xl font-black uppercase tracking-tighter">Product Setup</h3>
                       <button onClick={() => setEditItem(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
                   </div>
                   <form onSubmit={handleSaveProduct} className="space-y-8">
                       {/* Drag & Drop Area */}
                       <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Product Image</label>
                           <div 
                               onDragOver={onDragOver}
                               onDragLeave={onDragLeave}
                               onDrop={onDrop}
                               className={`
                                   relative aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 overflow-hidden group
                                   ${isDragging ? 'bg-black/5 border-black scale-[0.98]' : 'bg-gray-50 border-gray-200 hover:border-black/20'}
                                   ${editItem.imageUrl ? 'border-solid' : ''}
                               `}
                           >
                               {editItem.imageUrl ? (
                                   <>
                                       <img src={editItem.imageUrl} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button 
                                               type="button"
                                               onClick={() => setEditItem({...editItem, imageUrl: ''})}
                                               className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
                                           >
                                               <Trash className="w-5 h-5" />
                                           </button>
                                       </div>
                                   </>
                               ) : (
                                   <div className="text-center p-6">
                                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                           <Upload className={`w-5 h-5 transition-colors ${isDragging ? 'text-black' : 'text-gray-400'}`} />
                                       </div>
                                       <p className="text-[10px] font-black uppercase tracking-widest mb-1">Drop Image Here</p>
                                       <p className="text-[9px] text-gray-400 mb-4">or click to browse your files</p>
                                       <input 
                                           type="file" 
                                           accept="image/*" 
                                           className="absolute inset-0 opacity-0 cursor-pointer" 
                                           onChange={onFileChange}
                                       />
                                   </div>
                               )}
                           </div>
                           <div className="flex items-center gap-2 mt-2 px-2">
                               <LinkIcon className="w-3 h-3 text-gray-300" />
                               <input 
                                   className="flex-grow bg-transparent text-[10px] text-gray-400 outline-none font-mono"
                                   placeholder="Or paste an image URL here..."
                                   value={editItem.imageUrl.startsWith('data:') ? 'Base64 Encoded Image' : editItem.imageUrl}
                                   onChange={e => setEditItem({...editItem, imageUrl: e.target.value})}
                               />
                           </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div className="col-span-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Product Name</label>
                               <input required className="w-full border-2 border-gray-100 p-4 rounded-xl font-bold outline-none focus:border-black" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} />
                           </div>
                           <div>
                               <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Price (₹)</label>
                               <input type="number" required className="w-full border-2 border-gray-100 p-4 rounded-xl font-bold outline-none focus:border-black" value={editItem.price} onChange={e => setEditItem({...editItem, price: Number(e.target.value)})} />
                           </div>
                           <div>
                               <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Category</label>
                               <select className="w-full border-2 border-gray-100 p-4 rounded-xl font-bold outline-none focus:border-black" value={editItem.category} onChange={e => setEditItem({...editItem, category: e.target.value})}>
                                   <option>Accessories</option>
                                   <option>Books</option>
                                   <option>Home</option>
                                   <option>Prints</option>
                               </select>
                           </div>
                       </div>
                       
                       <button type="submit" disabled={isSyncing} className="w-full bg-black text-white py-5 rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl">
                           {isSyncing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Check className="w-5 h-5" />} Save Product
                       </button>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};

export default AdminPage;
