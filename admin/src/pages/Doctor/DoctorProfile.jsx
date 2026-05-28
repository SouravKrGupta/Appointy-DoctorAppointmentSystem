import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { assets } from '../../assets/assets'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)

  const updateProfile = async () => {
    try {
      const formData = new FormData()
      formData.append('address', JSON.stringify(profileData.address))
      formData.append('fees', profileData.fees)
      formData.append('about', profileData.about)
      formData.append('available', profileData.available)

      if (image) {
        formData.append('image', image)
      }

      const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', formData, { headers: { dToken } })

      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        setImage(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      console.log(error)
    }
  }

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken])

  return profileData && (
    <div className='page-wrap'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='page-kicker'>Doctor Profile</p>
          <h1 className='page-title'>Your professional details</h1>
          <p className='page-copy'>
            Keep your bio, clinic address, availability, and consultation fee accurate for patients and staff.
          </p>
        </div>
        <button
          type='button'
          onClick={isEdit ? updateProfile : () => setIsEdit(true)}
          className={isEdit ? 'primary-btn' : 'secondary-btn'}
        >
          {isEdit ? 'Save changes' : 'Edit profile'}
        </button>
      </div>

      <div className='mt-8 grid gap-6 xl:grid-cols-[320px_1fr]'>
        <aside className='shell-panel overflow-hidden p-5'>
          <div className='rounded-[28px] bg-gradient-to-br from-primary/20 via-primary/8 to-accent/15 p-4'>
            {isEdit ? (
              <label htmlFor='doctor-image' className='block cursor-pointer'>
                <img
                  className='h-[320px] w-full rounded-[24px] object-cover'
                  src={image ? URL.createObjectURL(image) : profileData.image}
                  alt=''
                />
                <div className='mt-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-4 py-2 text-sm font-medium text-primary shadow-sm'>
                  <img className='w-4' src={assets.upload_area} alt='' />
                  <span>Change photo</span>
                </div>
                <input
                  id='doctor-image'
                  type='file'
                  accept='image/*'
                  hidden
                  onChange={(e) => setImage(e.target.files[0] || false)}
                />
              </label>
            ) : (
              <img className='h-[320px] w-full rounded-[24px] object-cover' src={profileData.image} alt="" />
            )}
          </div>

          <div className='mt-5'>
            <p className='display-font text-2xl font-semibold text-ink'>{profileData.name}</p>
            <p className='mt-2 text-sm text-slate-500'>{profileData.degree} - {profileData.speciality}</p>
            <div className='mt-4 flex flex-wrap gap-2'>
              <span className='profile-chip'>{profileData.experience}</span>
              <span className={profileData.available ? 'status-chip status-complete' : 'status-chip status-cancelled'}>
                {profileData.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </aside>

        <section className='data-card p-5 sm:p-6 lg:p-8'>
          <div className='grid gap-8 lg:grid-cols-[1.2fr_0.8fr]'>
            <div>
              <h2 className='section-title'>About</h2>
              <p className='section-copy mt-2'>Share the doctor summary shown to patients and administrators.</p>

              <div className='mt-5'>
                {isEdit ? (
                  <textarea
                    onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                    className='field-textarea'
                    rows={8}
                    value={profileData.about}
                  />
                ) : (
                  <div className='mini-card text-sm leading-7 text-slate-600'>
                    {profileData.about}
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-5'>
              <div className='mini-card'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Consultation fee</p>
                <div className='mt-3'>
                  {isEdit ? (
                    <input
                      type='number'
                      onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                      value={profileData.fees}
                      className='field-input'
                    />
                  ) : (
                    <p className='display-font text-2xl font-semibold text-ink'>{currency} {profileData.fees}</p>
                  )}
                </div>
              </div>

              <div className='mini-card'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Clinic address</p>
                <div className='mt-4 space-y-3'>
                  {isEdit ? (
                    <>
                      <input
                        type='text'
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                        value={profileData.address.line1}
                        className='field-input'
                      />
                      <input
                        type='text'
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                        value={profileData.address.line2}
                        className='field-input'
                      />
                    </>
                  ) : (
                    <p className='text-sm leading-7 text-slate-600'>
                      {profileData.address.line1}
                      <br />
                      {profileData.address.line2}
                    </p>
                  )}
                </div>
              </div>

              <div className='mini-card'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Booking status</p>
                <div className='mt-4 toggle-wrap'>
                  <input
                    type="checkbox"
                    onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
                    checked={profileData.available}
                    className='h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/20'
                  />
                  <label className='text-sm font-medium text-slate-600'>Available for appointments</label>
                </div>
              </div>
            </div>
          </div>

          {isEdit && (
            <div className='mt-8 flex flex-wrap gap-3'>
              <button type='button' onClick={updateProfile} className='primary-btn'>Save changes</button>
              <button type='button' onClick={() => { setIsEdit(false); setImage(false); getProfileData() }} className='secondary-btn'>Cancel edit</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default DoctorProfile
