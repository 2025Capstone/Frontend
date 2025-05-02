import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom"; // For redirection after login
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../src/firebase"; // Firebase auth for student login
import { useThemeStore } from "../../store"; // Assuming theme state is needed

// --- Reusable Styled Components (Can be imported from a shared file or defined here) ---
// Using similar components as Register for consistency
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 100vh;
  background-color: ${(props) => props.theme.backgroundColor};
  padding: 0 1rem;
  font-family: "Source Sans Pro", sans-serif;
  transition: background-color 0.3s ease;
`;

const Header = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1rem;
  color: ${(props) => props.theme.textColor};
  flex-shrink: 0;
`;

const ProjectTitle = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
`;

const ThemeToggleButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.textColor};
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background-color 0.2s, color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  .material-symbols-outlined { font-size: 1.4rem; }
  &:hover { background-color: ${(props) => props.theme.textColor}1A; }
`;

const MainContent = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  width: 100%;
  max-width: 900px; /* Adjust if illustration is used */
  flex-grow: 1;
  padding: 2rem 0;
`;

const FormContainer = styled.div`
  background-color: ${(props) => props.theme.formContainerColor};
  padding: 2.5rem 3rem;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 450px;
  transition: background-color 0.3s ease;
   @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    max-width: 100%;
  }
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem; /* More space below title */
  color: ${(props) => props.theme.textColor};
`;

const InputGroup = styled.div`
  position: relative;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  font-size: 1rem;
  background-color: ${(props) => props.theme.backgroundColor || 'white'}; // Ensure theme has inputBackgroundColor
  color: ${(props) => props.theme.textColor};
  transition: border-color 0.2s ease-in-out, background-color 0.3s ease, color 0.3s ease;
  &::placeholder { color: ${(props) => props.theme.subTextColor}; }
  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.btnColor};
    box-shadow: 0 0 0 2px ${(props) => props.theme.btnColor}4D;
  }
`;

const PasswordInputGroup = styled(InputGroup)`/* Inherits InputGroup */`;

const ToggleButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${(props) => props.theme.subTextColor};
  padding: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  .material-symbols-outlined { font-size: 1.2rem; }
`;

const MessageArea = styled.div`
  min-height: 1.2em;
  text-align: center;
  margin-top: 0.5rem; /* Space above message */
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 0.85rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  background-color: ${(props) => props.theme.btnColor};
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.5rem; /* More space above button */
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.hoverBtnColor}; // Ensure theme has hoverBtnColor
    box-shadow: 0 4px 10px ${(props) => props.theme.btnColor}66;
  }
  &:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const LinkText = styled.p` // Renamed from SignInLinkText for generic use
  text-align: center;
  font-size: 0.9rem;
  margin-top: 1.5rem;
  color: ${(props) => props.theme.subTextColor};
`;

const StyledLink = styled.a` // Renamed from SignInLink
  color: ${(props) => props.theme.btnColor};
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.3rem;
  &:hover { text-decoration: underline; }
`;

const Footer = styled.footer`
  width: 100%;
  max-width: 1200px;
  text-align: center;
  padding: 1.5rem 1rem;
  color: ${(props) => props.theme.subTextColor};
  flex-shrink: 0;
`;
// --- Styled Components Definitions End ---

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  // Theme state (if needed for logic, otherwise only ThemeProvider is needed)
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const handleShowPassword = () => setShowPassword(true);
  const handleHidePassword = () => setShowPassword(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!email || !pw) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      // 1. Get User Role
      const roleResponse = await fetch('http://127.0.0.1:8000/api/v1/auth/user-role', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      if (!roleResponse.ok) {
         // Try to get error details from role API
         let roleApiError = '사용자 역할 확인 중 오류 발생';
         try {
             const errorData = await roleResponse.json();
             roleApiError = errorData.detail || JSON.stringify(errorData);
         } catch (jsonError) {
             roleApiError = `HTTP Error ${roleResponse.status}: ${roleResponse.statusText}`;
         }
         throw new Error(roleApiError);
      }

      const roleData = await roleResponse.json();
      const userRole = roleData.role || 'none'; // Adjust based on actual API response structure

      console.log("User Role:", userRole); // Log the role

      // 2. Role-Specific Login Logic
      switch (userRole) {
        case 'student':
          console.log("Attempting Student Login via Firebase...");
          // Firebase Login
          const userCredential = await signInWithEmailAndPassword(auth, email, pw);
          console.log("Firebase Login Success:", userCredential.user.uid);

          // Get Firebase ID Token
          const token = await userCredential.user.getIdToken();
          console.log("Firebase ID Token obtained.");

          // Verify Token with Backend
          const verifyResponse = await fetch('http://127.0.0.1:8000/api/v1/auth/verify-token', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
             // No body needed according to curl example
          });

          if (!verifyResponse.ok) {
             let verifyApiError = '토큰 인증 실패';
             try {
                 const errorData = await verifyResponse.json();
                 verifyApiError = errorData.detail || JSON.stringify(errorData);
             } catch (jsonError) {
                 verifyApiError = `HTTP Error ${verifyResponse.status}: ${verifyResponse.statusText}`;
             }
            throw new Error(verifyApiError);
          }

          console.log("Student Login and Token Verification Successful!");
          // TODO: Store necessary student user data/token from verifyResponse if needed
          // TODO: Redirect to student dashboard
          navigate('/student/dashboard'); // Example redirect
          break;

        case 'instructor':
          console.log("Attempting Instructor Login via API...");
          const instructorLoginResponse = await fetch('http://127.0.0.1:8000/api/v1/instructors-auth/login', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, password: pw }),
          });

          if (!instructorLoginResponse.ok) {
             let instructorApiError = '강의자 로그인 실패';
             try {
                 const errorData = await instructorLoginResponse.json();
                 instructorApiError = errorData.detail || JSON.stringify(errorData);
             } catch (jsonError) {
                  instructorApiError = `HTTP Error ${instructorLoginResponse.status}: ${instructorLoginResponse.statusText}`;
             }
            throw new Error(instructorApiError);
          }

          const instructorData = await instructorLoginResponse.json();
          console.log("Instructor Login Successful:", instructorData);
           // TODO: Store necessary instructor token/data (e.g., instructorData.access_token)
           // TODO: Redirect to instructor dashboard
          navigate('/instructor/courses'); // Example redirect
          break;

        case 'admin':
          console.log("Attempting Admin Login via API...");
           const adminLoginResponse = await fetch('http://127.0.0.1:8000/api/v1/auth/admin-login', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json',
            },
            // Using email as username as implied
            body: JSON.stringify({ username: email, password: pw }),
          });

           if (!adminLoginResponse.ok) {
             let adminApiError = '관리자 로그인 실패';
             try {
                 const errorData = await adminLoginResponse.json();
                 adminApiError = errorData.detail || JSON.stringify(errorData);
             } catch (jsonError) {
                 adminApiError = `HTTP Error ${adminLoginResponse.status}: ${adminLoginResponse.statusText}`;
             }
            throw new Error(adminApiError);
          }

          const adminData = await adminLoginResponse.json();
          console.log("Admin Login Successful:", adminData);
           // TODO: Store necessary admin token/data
           // TODO: Redirect to admin dashboard
          navigate('/admin/user/student'); // Example redirect
          break;

        case 'none':
        default:
          setError("등록되지 않은 사용자이거나 역할 정보가 없습니다.");
          break;
      }

    } catch (err: any) {
      console.error("Login process failed:", err);
      // Firebase errors might have a 'code' property
      if (err.code) {
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential': // Common Firebase login error code
                setError("이메일 또는 비밀번호가 잘못되었습니다.");
                break;
            case 'auth/invalid-email':
                setError("유효하지 않은 이메일 형식입니다.");
                break;
            // Add other Firebase specific error codes if needed
            default:
                setError(err.message || "로그인 중 오류가 발생했습니다.");
        }
      } else {
         // API or other errors
         setError(err.message || "로그인 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Header>
        <ProjectTitle>Project Title</ProjectTitle>
        <ThemeToggleButton onClick={toggleTheme}>
          {isDark ? ( <span className="material-symbols-outlined">light_mode</span> )
                 : ( <span className="material-symbols-outlined">dark_mode</span> )}
        </ThemeToggleButton>
      </Header>

      <MainContent>
        <FormContainer>
          <StyledForm onSubmit={handleSubmit}>
            <Title>Login</Title>

            <InputGroup>
              <StyledInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                required
              />
            </InputGroup>

            <PasswordInputGroup>
              <StyledInput
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Enter Password"
                type={showPassword ? "text" : "password"}
                required
              />
              <ToggleButton
                type="button"
                onMouseDown={handleShowPassword}
                onMouseUp={handleHidePassword}
                onMouseLeave={handleHidePassword}
                onTouchStart={handleShowPassword}
                onTouchEnd={handleHidePassword}
                disabled={loading}
              >
                <span className="material-symbols-outlined">visibility</span>
              </ToggleButton>
            </PasswordInputGroup>

            <MessageArea>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {!error && '\u00A0'}
            </MessageArea>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </SubmitButton>
            <LinkText>
              Don't have an account?
              <StyledLink href="/register">Sign Up</StyledLink>
            </LinkText>

          </StyledForm>
        </FormContainer>
      </MainContent>
    </PageContainer>
  );
}