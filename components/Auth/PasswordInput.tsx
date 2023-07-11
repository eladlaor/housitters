import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { Button, Form } from 'react-bootstrap'

export default function PasswordInput({
  password,
  setPassword,
}: {
  password: string
  setPassword: Function
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="input-group">
      <Form.Control
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        variant="info"
        type="button"
        className="password-toggle-button"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
      </Button>
    </div>
  )
}
