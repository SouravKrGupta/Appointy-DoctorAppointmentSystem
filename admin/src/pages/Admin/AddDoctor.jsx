import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')

  const { backendUrl } = useContext(AdminContext)
  const { aToken } = useContext(AdminContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (!docImg) {
        return toast.error('Image Not Selected')
      }

      const formData = new FormData()

      formData.append('image', docImg)
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('experience', experience)
      formData.append('fees', Number(fees))
      formData.append('about', about)
      formData.append('speciality', speciality)
      formData.append('degree', degree)
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

      const response = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, {
        headers: { aToken }
      })
      const data = response.data
      if (data.success) {
        toast.success(data.message)
        setDocImg(false)
        setName('')
        setPassword('')
        setEmail('')
        setAddress1('')
        setAddress2('')
        setDegree('')
        setAbout('')
        setFees('')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
      console.error(error)
    }
  }

  return (
    <div className='page-wrap'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='page-kicker'>Doctor Onboarding</p>
          <h1 className='page-title'>Add a new doctor</h1>
          <p className='page-copy'>
            Create a provider profile with credentials, specialty, consultation fee, contact details, and bio.
          </p>
        </div>
        <div className='mini-card max-w-sm'>
          <p className='text-xs font-semibold uppercase tracking-[0.24em] text-slate-400'>Before you submit</p>
          <p className='mt-2 text-sm leading-6 text-slate-500'>
            Make sure the profile image, experience, and address are ready so the doctor can start appearing in the directory immediately.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmitHandler} className='data-card mt-8 overflow-hidden'>
        <div className='grid gap-8 px-5 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8 lg:py-8'>
          <div className='mini-card h-fit lg:sticky lg:top-6'>
            <label htmlFor="doc-img" className='block cursor-pointer'>
              <img
                className='h-64 w-full rounded-[24px] border border-primary/10 bg-white object-cover'
                src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                alt=""
              />
            </label>
            <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
            <p className='mt-4 display-font text-lg font-semibold text-ink'>Profile image</p>
            <p className='mt-2 text-sm leading-6 text-slate-500'>
              Upload a clear doctor portrait for the patient directory and admin tools.
            </p>
            <label htmlFor="doc-img" className='secondary-btn mt-5 cursor-pointer'>Choose image</label>

            <div className='mt-6 rounded-[22px] border border-primary/10 bg-primary/5 p-4'>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary'>Profile checklist</p>
              <ul className='mt-3 space-y-2 text-sm leading-6 text-slate-600'>
                <li>Use a valid email for doctor login.</li>
                <li>Set fee, speciality, and degree clearly.</li>
                <li>Finish the address so patients can identify the clinic.</li>
              </ul>
            </div>
          </div>

          <div className='space-y-8'>
            <div className='grid gap-5 lg:grid-cols-2'>
              <div>
                <label className='field-label' htmlFor='doctor-name'>Doctor name</label>
                <input
                  id='doctor-name'
                  onChange={e => setName(e.target.value)}
                  value={name}
                  className='field-input'
                  type="text"
                  placeholder='Full name'
                  required
                />
              </div>

              <div>
                <label className='field-label' htmlFor='doctor-email'>Doctor email</label>
                <input
                  id='doctor-email'
                  onChange={e => setEmail(e.target.value)}
                  value={email}
                  className='field-input'
                  type="email"
                  placeholder='doctor@clinic.com'
                  required
                />
              </div>

              <div>
                <label className='field-label' htmlFor='doctor-password'>Set password</label>
                <input
                  id='doctor-password'
                  onChange={e => setPassword(e.target.value)}
                  value={password}
                  className='field-input'
                  type="password"
                  placeholder='Create a password'
                  required
                />
              </div>

              <div>
                <label className='field-label' htmlFor='doctor-experience'>Experience</label>
                <select
                  id='doctor-experience'
                  onChange={e => setExperience(e.target.value)}
                  value={experience}
                  className='field-select'
                >
                  <option value="1 Year">1 Year</option>
                  <option value="2 Year">2 Years</option>
                  <option value="3 Year">3 Years</option>
                  <option value="4 Year">4 Years</option>
                  <option value="5 Year">5 Years</option>
                  <option value="6 Year">6 Years</option>
                  <option value="8 Year">8 Years</option>
                  <option value="9 Year">9 Years</option>
                  <option value="10 Year">10+ Years</option>
                </select>
              </div>

              <div>
                <label className='field-label' htmlFor='doctor-speciality'>Speciality</label>
                <select
                  id='doctor-speciality'
                  onChange={e => setSpeciality(e.target.value)}
                  value={speciality}
                  className='field-select'
                >
                  <option value="General physician">General physician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatricians">Pediatricians</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Gastroenterologist">Gastroenterologist</option>
                </select>
              </div>

              <div>
                <label className='field-label' htmlFor='doctor-fees'>Consultation fee</label>
                <input
                  id='doctor-fees'
                  onChange={e => setFees(e.target.value)}
                  value={fees}
                  className='field-input'
                  type="number"
                  placeholder='Doctor fees'
                  required
                />
              </div>

              <div>
                <label className='field-label' htmlFor='doctor-degree'>Degree</label>
                <input
                  id='doctor-degree'
                  onChange={e => setDegree(e.target.value)}
                  value={degree}
                  className='field-input'
                  type="text"
                  placeholder='Degree or qualification'
                  required
                />
              </div>

              <div>
                <label className='field-label' htmlFor='doctor-address1'>Address line 1</label>
                <input
                  id='doctor-address1'
                  onChange={e => setAddress1(e.target.value)}
                  value={address1}
                  className='field-input'
                  type="text"
                  placeholder='Street, building, or clinic name'
                  required
                />
              </div>

              <div className='lg:col-span-2'>
                <label className='field-label' htmlFor='doctor-address2'>Address line 2</label>
                <input
                  id='doctor-address2'
                  onChange={e => setAddress2(e.target.value)}
                  value={address2}
                  className='field-input'
                  type="text"
                  placeholder='City, area, or landmark'
                  required
                />
              </div>
            </div>

            <div>
              <label className='field-label' htmlFor='doctor-about'>About doctor</label>
              <textarea
                id='doctor-about'
                onChange={e => setAbout(e.target.value)}
                value={about}
                className='field-textarea'
                rows={5}
                placeholder='Write a short professional summary'
              />
            </div>

            <div className='flex flex-wrap gap-3'>
              <button type='submit' className='primary-btn'>Add doctor</button>
              <button
                type='button'
                onClick={() => {
                  setDocImg(false)
                  setName('')
                  setEmail('')
                  setPassword('')
                  setExperience('1 Year')
                  setFees('')
                  setAbout('')
                  setSpeciality('General physician')
                  setDegree('')
                  setAddress1('')
                  setAddress2('')
                }}
                className='secondary-btn'
              >
                Reset form
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddDoctor
