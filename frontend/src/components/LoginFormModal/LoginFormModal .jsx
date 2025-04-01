import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginFormModal.css';

function LoginFormModal() {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState([]);
    const [showReset, setShowReset] = useState(false); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        return dispatch(sessionActions.login({ credential, password }))
            .then(closeModal)
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors);
                }
            });
    };

    const handleDemoLogin = async () => {
        const demoCredential = 'Demo-lition';
        const demoPassword = 'password';
        setErrors([]);
        return dispatch(sessionActions.login(demoCredential, demoPassword))
            .then(closeModal)
            .catch(async (res) => {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors);
                }
            });
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
       
      
        const response = await dispatch(sessionActions.resetPassword({ credential })); 
        if (response.success) {
            alert('Password reset email sent!'); 
            setShowReset(false); 
        } else {
            setErrors(response.errors); 
        }
    };

    return (
        <div className="login-modal">
            <h1>Log In</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Username or Email
                    <input
                        type="text"
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                {errors.credential && <p className="error-message">{errors.credential}</p>}
                <button type="submit">Log In</button>
                <button type="button" className="demo-button" onClick={handleDemoLogin}>
                    Log In as Demo User
                </button>
            </form>
            <button onClick={() => setShowReset(true)}>Forgot Password?</button>

            {showReset && (
                <div className="reset-modal">
                    <h2>Password Reset</h2>
                    <form onSubmit={handlePasswordReset}>
                        <label>
                            Enter your email to reset password:
                            <input
                                type="text"
                                value={credential}
                                onChange={(e) => setCredential(e.target.value)}
                                required
                            />
                        </label>
                        <button type="submit">Send Reset Link</button>
                        <button type="button" onClick={() => setShowReset(false)}>Cancel</button>
                        {errors.map((error, idx) => (
                            <p key={idx} className="error-message">{error}</p>
                        ))}
                    </form>
                </div>
            )}
        </div>
    );
}

export default LoginFormModal;