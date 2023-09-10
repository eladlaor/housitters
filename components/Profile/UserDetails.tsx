// import { Button, Form, Container, Row, Col, Spinner } from 'react-bootstrap'
// import Picture from '../Picture'
// import { DbGenderTypes, PageRoutes, SIGNUP_FORM_PROPS, UserType } from '../../utils/constants'
// import PetsCounter from '../PetsCounter'
// import { useDispatch, useSelector } from 'react-redux'
// import {
//   selectAvatarUrlState,
//   selectEmailState,
//   selectFirstNameState,
//   selectGenderState,
//   selectLastNameState,
//   setAvatarUrl,
// } from '../../slices/userSlice'
// import { useEffect, useState } from 'react'
// import CountAndUpdate from '../utils/CountAndUpdate'
// import { selectExperienceState, setExperienceState } from '../../slices/housitterSlice'
// import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
// import { getUrlFromSupabase } from '../../utils/helpers'
// import { useRouter } from 'next/router'
// import { removeInvalidCharacters, resizeImage } from '../../utils/files'

// export default function UserDetails({ isHousitter }: { isHousitter: boolean }) {
//   const firstName = useSelector(selectFirstNameState)
//   const lastName = useSelector(selectLastNameState)
//   const gender = useSelector(selectGenderState)
//   const user = useUser()
//   const supabaseClient = useSupabaseClient()
//   const email = useSelector(selectEmailState)
//   const avatarUrl = useSelector(selectAvatarUrlState)
//   const router = useRouter()
//   const experience = useSelector(selectExperienceState)
//   const dispatch = useDispatch()
//   const [updatedAvatarPreviewUrl, setUpdatedAvatarPreviewUrl] = useState('')
//   const [isUploading, setIsUploading] = useState(false)

//   useEffect(() => {
//     if (!user) {
//       return
//     }

//     const getUserData = async () => {
//       const { data, error } = await supabaseClient
//         .from('profiles')
//         .select('*')
//         .eq('id', user.id)
//         .single()

//       if (error) {
//         return
//       }

//       if (data) {
//       }
//     }

//     getUserData()
//   })

//   const initialFormState: any = {
//     firstName,
//     lastName,
//     email,
//     gender,
//   }

//   const [form, setForm] = useState(initialFormState)

//   function setFormField(field: string, value: any) {
//     setForm((previousState: any) => {
//       return {
//         ...previousState,
//         [field]: value,
//       }
//     })
//   }

//   async function handleSubmit() {
//     if (!user) {
//       alert(`user did not load yet, please try again`)
//       return
//     }

//     let newAvatarUrl: string | boolean = false
//     let newAvatar = (document.getElementById('avatarInput') as any).files[0]
//     if (newAvatar) {
//       const ext = newAvatar.name.split('.').pop()
//       const filename = crypto.randomUUID() + '.' + ext
//       const { data, error } = await supabaseClient.storage
//         .from('avatars')
//         .upload(filename, newAvatar)

//       if (error) {
//         console.log('failed downloading avatar. Error: ' + error)
//         debugger
//         return
//       }

//       if (data) {
//         newAvatarUrl = filename
//       }
//     }

//     const updatedProfile = {
//       id: user.id,
//       first_name: form.firstName,
//       last_name: form.lastName,
//       gender: form.gender,
//       email: form.email,
//       avatar_url: newAvatarUrl || avatarUrl,
//     }

//     const { error, data } = await supabaseClient.from('profiles').upsert(updatedProfile)
//     if (error) {
//       alert(`failed upserting updated profile: ${error}`)
//       debugger
//       return
//     }

//     // this is done in order to make HomeNavbar re-render after changing the avatar, so the change would be reflected immediately
//     dispatch(setAvatarUrl(newAvatarUrl))

//     if (isHousitter) {
//       let { error: housitterUpsertError } = await supabaseClient.from('housitters').upsert({
//         user_id: user?.id,
//         experience,
//       })

//       if (housitterUpsertError) {
//         alert('Error updating the data: ' + housitterUpsertError)
//         throw housitterUpsertError
//       }
//     } else {
//       let { error: landlordUpsertError } = await supabaseClient.from('landlords').upsert({
//         user_id: user?.id,
//         location,
//       })

//       if (landlordUpsertError) {
//         alert('Error updating the data: ' + landlordUpsertError)
//         debugger
//         return
//       }
//     }

//     alert(`profile updated successfuly`)
//     router.push('/')
//   }

//   async function handleAvatarUpdate(event: any) {
//     setIsUploading(true)
//     try {
//       if (!event.target.files || event.target.files.length === 0) {
//         throw new Error('You must select an image to upload.')
//       }

//       for (const file of event.target.files) {
//         const fileName = removeInvalidCharacters(file.name)
//         const resizedImage = await resizeImage(file, 1920, 1080)

//         let { error: uploadError } = await supabaseClient.storage
//           .from('avatars')
//           .upload(`${user?.id}-${fileName}`, resizedImage, { upsert: true })

//         if (uploadError) {
//           alert(`error in UserDetails trying to upload an image to storage ` + uploadError)
//           throw uploadError
//         }

//         setUpdatedAvatarPreviewUrl(fileName)
//       }
//     } catch (e: any) {
//       console.log(`failed selecting new image for post: ${e}`)
//       debugger
//     }
//     setIsUploading(false)
//   }

//   return (
//     <Container className="mt-4">
//       <h1>Profile Editor</h1>
//       <Form>
//         <Row>
//           <Col>
//             <Form.Group className="mb-3" controlId={SIGNUP_FORM_PROPS.FIRST_NAME}>
//               <Form.Label>First Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder=""
//                 value={form.firstName}
//                 onChange={(e) => {
//                   setFormField(SIGNUP_FORM_PROPS.FIRST_NAME, e.target.value)
//                 }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-3" controlId={SIGNUP_FORM_PROPS.LAST_NAME}>
//               <Form.Label>Last Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder=""
//                 value={form.lastName}
//                 onChange={(e) => {
//                   setFormField(SIGNUP_FORM_PROPS.LAST_NAME, e.target.value)
//                 }}
//               />
//             </Form.Group>
//             <Form.Group className="mb-3" controlId={SIGNUP_FORM_PROPS.EMAIL}>
//               <Form.Label>Email</Form.Label>
//               <Form.Control
//                 type="email"
//                 placeholder="Enter email"
//                 value={form.email}
//                 onChange={(e) => {
//                   setFormField(SIGNUP_FORM_PROPS.EMAIL, e.target.value)
//                 }}
//               />
//             </Form.Group>
//             {!isHousitter && (
//               <Form.Group>
//                 <Form.Label>Pets</Form.Label>
//                 <PetsCounter />
//                 <hr />
//               </Form.Group>
//             )}
//             {isHousitter && (
//               <Form.Group>
//                 <Form.Label className="mb-2">Experience</Form.Label>
//                 <Form.Text className="mb-2" muted></Form.Text>
//                 <CountAndUpdate valueToCount={experience} reduxReducer={setExperienceState} />
//                 <hr />
//               </Form.Group>
//             )}
//             <Form.Group>
//               <Form.Label>Gender</Form.Label>
//               <Form.Select
//                 value={form.gender}
//                 onChange={(e) => setFormField(SIGNUP_FORM_PROPS.GENDER, e.target.value)}
//               >
//                 <option value={DbGenderTypes.Male}>{DbGenderTypes.Male}</option>
//                 <option value={DbGenderTypes.Female}>{DbGenderTypes.Female}</option>
//                 <option value={DbGenderTypes.NonBinary}>{DbGenderTypes.NonBinary}</option>
//                 <option value={DbGenderTypes.Unknown}>{DbGenderTypes.Unknown}</option>
//               </Form.Select>
//               <hr />
//             </Form.Group>
//           </Col>
//           <Col>
//             <Form.Group>
//               <h5>Current picture</h5>
//               {isUploading ? (
//                 <Spinner />
//               ) : (
//                 <img
//                   src={
//                     updatedAvatarPreviewUrl
//                       ? getUrlFromSupabase(user?.id + '-' + updatedAvatarPreviewUrl, 'avatars')
//                       : getUrlFromSupabase(avatarUrl, 'avatars')
//                   }
//                   style={{ width: '10rem', height: '10rem', borderRadius: '1000px' }}
//                 />
//               )}
//               <h5>Update picture</h5>
//               <input id="avatarInput" type="file" onChange={handleAvatarUpdate} />
//             </Form.Group>
//           </Col>
//         </Row>

//         <Button
//           style={{ float: 'left' }}
//           variant="primary"
//           type="submit"
//           onClick={(e) => {
//             e.preventDefault()
//             handleSubmit()
//           }}
//         >
//           Submit
//         </Button>
//       </Form>
//     </Container>
//   )
// }
