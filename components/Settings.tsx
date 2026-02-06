
import React, { useState } from 'react';
import { User, Industry } from '../types';
import { ICONS } from '../constants';

const industries: Industry[] = ['Manufacturing', 'Retail', 'Agriculture', 'Services', 'Logistics', 'E-commerce'];

interface SettingsProps {
  user: User;
  onUpdate: (updatedProfile: Partial<User>) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    age: user.age || 0,
    phoneNumber: user.phoneNumber || '',
    location: user.location || '',
    gstNumber: user.gstNumber || '',
    businessName: user.businessName || '',
    industry: user.industry || 'Retail' as Industry
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSaved, setIsSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const isAdmin = user.role === 'admin';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.currentPassword !== user.password) {
      setPasswordError('Current password verification failed.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Confirmation password does not match.');
      return;
    }

    onUpdate({ password: passwordForm.newPassword });
    setPasswordSuccess(true);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-soft">
        <div className="flex items-center space-x-4 mb-10">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <ICONS.Settings size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Profile Calibration</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Manage SME Node Metadata & Identity</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Channel</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Geographic Coordinates</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold"
                placeholder="City, State"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                <span>Industry Classification</span>
                {!isAdmin && <span className="text-[8px] text-amber-600">Admin Controlled</span>}
              </label>
              {isAdmin ? (
                <select 
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold"
                >
                  {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              ) : (
                <div className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-5 py-4 text-slate-400 font-bold flex items-center justify-between cursor-not-allowed">
                  <span>{formData.industry}</span>
                  <div className="p-1 bg-white border border-slate-200 rounded-md text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold"
              />
            </div>
          </div>

          <div className="pt-6 flex flex-col items-center">
            <button
              type="submit"
              className="px-12 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-premium hover:scale-[1.02] active:scale-95 transition-all"
            >
              Commit Profile Changes
            </button>
            {isSaved && (
              <p className="mt-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-bounce">
                System Synchronized Successfully
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Security / Password Section */}
      <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-200 shadow-soft">
        <div className="flex items-center space-x-4 mb-10">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <ICONS.Risk size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Credential Security</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Rotate Access Tokens & Passwords</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Security Token</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Access Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-bold"
                placeholder="••••••••"
              />
            </div>
          </div>

          {passwordError && (
            <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">{passwordError}</p>
          )}

          <div className="pt-6 flex flex-col items-center">
            <button
              type="submit"
              className="px-12 py-4 bg-blue-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-premium hover:scale-[1.02] active:scale-95 transition-all"
            >
              Update Security Matrix
            </button>
            {passwordSuccess && (
              <p className="mt-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-bounce">
                Security Token Rotated Successfully
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
