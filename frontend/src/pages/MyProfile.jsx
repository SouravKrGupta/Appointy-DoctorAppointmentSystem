import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)

  const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData()
      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)
      if (image) formData.append('image', image)

      const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, {
        headers: { token },
      })

      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  if (!userData) {
    return null
  }

  return (
    <div className='section-shell pt-6'>
      <div className='grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]'>
        <aside className='surface-panel-strong p-6 sm:p-7'>
          {isEdit ? (
            <label htmlFor='image' className='group block cursor-pointer'>
              <div className='relative overflow-hidden rounded-[28px]'>
                <img
                  className='h-72 w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105'
                  src={image ? URL.createObjectURL(image) : userData.image}
                  alt={userData.name}
                />
                <div className='absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[#183533]/80 to-transparent p-4 text-white'>
                  <span className='text-sm font-semibold'>Update photo</span>
                  <img className='w-8' src={assets.upload_icon} alt='' />
                </div>
              </div>
              <input onChange={(e) => setImage(e.target.files[0])} type='file' id='image' hidden />
            </label>
          ) : (
            <img className='h-72 w-full rounded-[28px] object-cover' src={userData.image} alt={userData.name} />
          )}

          <div className='mt-6 space-y-4'>
            {isEdit ? (
              <input
                className='field-input text-2xl font-semibold'
                type='text'
                onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
                value={userData.name}
              />
            ) : (
              <h1 className='section-heading text-3xl'>{userData.name}</h1>
            )}

            <div className='space-y-3 rounded-[24px] border border-[rgba(24,53,51,0.1)] bg-white/80 p-4'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>Email</p>
                <p className='mt-1 text-sm text-slate-600'>{userData.email}</p>
              </div>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>Status</p>
                <p className='mt-1 text-sm text-slate-600'>Profile details saved for faster future bookings.</p>
              </div>
            </div>

            <button
              onClick={isEdit ? updateUserProfileData : () => setIsEdit(true)}
              className={isEdit ? 'primary-btn w-full' : 'secondary-btn w-full'}
            >
              {isEdit ? 'Save information' : 'Edit profile'}
            </button>
          </div>
        </aside>

        <section className='surface-panel p-6 sm:p-8'>
          <div className='space-y-6'>
            <div>
              <p className='section-kicker'>Contact information</p>
              <h2 className='section-heading text-3xl'>Keep your booking details ready.</h2>
            </div>

            <div className='grid gap-5 sm:grid-cols-2'>
              <div>
                <label className='field-label'>Phone</label>
                {isEdit ? (
                  <input
                    className='field-input'
                    type='text'
                    onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))}
                    value={userData.phone}
                  />
                ) : (
                  <div className='field-input flex items-center'>{userData.phone}</div>
                )}
              </div>

              <div>
                <label className='field-label'>Gender</label>
                {isEdit ? (
                  <select
                    className='field-input'
                    onChange={(e) => setUserData((prev) => ({ ...prev, gender: e.target.value }))}
                    value={userData.gender}
                  >
                    <option value='Not Selected'>Not Selected</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                  </select>
                ) : (
                  <div className='field-input flex items-center'>{userData.gender}</div>
                )}
              </div>
            </div>

            <div className='grid gap-5 sm:grid-cols-2'>
              <div>
                <label className='field-label'>Address line 1</label>
                {isEdit ? (
                  <input
                    className='field-input'
                    type='text'
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...(prev.address || {}), line1: e.target.value },
                      }))
                    }
                    value={userData.address?.line1 || ''}
                  />
                ) : (
                  <div className='field-input flex items-center'>{userData.address?.line1 || 'Not set'}</div>
                )}
              </div>

              <div>
                <label className='field-label'>Address line 2</label>
                {isEdit ? (
                  <input
                    className='field-input'
                    type='text'
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: { ...(prev.address || {}), line2: e.target.value },
                      }))
                    }
                    value={userData.address?.line2 || ''}
                  />
                ) : (
                  <div className='field-input flex items-center'>{userData.address?.line2 || 'Not set'}</div>
                )}
              </div>
            </div>

            <div>
              <p className='section-kicker'>Basic information</p>
            </div>

            <div className='grid gap-5 sm:grid-cols-2'>
              <div>
                <label className='field-label'>Birthday</label>
                {isEdit ? (
                  <input
                    className='field-input'
                    type='date'
                    onChange={(e) => setUserData((prev) => ({ ...prev, dob: e.target.value }))}
                    value={userData.dob}
                  />
                ) : (
                  <div className='field-input flex items-center'>{userData.dob || 'Not set'}</div>
                )}
              </div>

              <div>
                <label className='field-label'>Profile summary</label>
                <div className='field-input min-h-[52px]'>
                  {userData.name} is ready for smoother future bookings with saved personal details.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default MyProfile
