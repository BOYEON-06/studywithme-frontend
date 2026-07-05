import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authContinue, checkName } from "../api/authAPI";
import "./Login.css";

function Login() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState<1 | 2>(1);
    const [isNewMember, setIsNewMember] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleCheckName = async () => {
        if (!name.trim()) {
            alert("이름을 입력하세요.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");
            const res = await checkName(name.trim());
            if (res.success) {
                setIsNewMember(!res.data); // data가 false이면 신규 회원
                setMessage(res.message);
                setStep(2);
            } else {
                alert(res.message || "이름 확인에 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("서버 연결에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async () => {
        if (!password.trim()) {
            alert("비밀번호를 입력하세요.");
            return;
        }

        if (isNewMember) {
            if (!confirmPassword.trim()) {
                alert("비밀번호 확인을 입력하세요.");
                return;
            }
            if (password !== confirmPassword) {
                alert("비밀번호가 일치하지 않습니다.");
                return;
            }
        }

        try {
            setLoading(true);
            const data = await authContinue({
                name: name.trim(),
                password,
            });

            sessionStorage.setItem("user", JSON.stringify(data.user));
            alert(data.message || (isNewMember ? "회원가입 성공" : "로그인 성공"));
            navigate("/home");
        } catch (error) {
            console.error(error);
            alert(isNewMember ? "회원가입에 실패했습니다." : "로그인에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        setStep(1);
        setPassword("");
        setConfirmPassword("");
        setIsNewMember(null);
        setMessage("");
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (step === 1) {
            handleCheckName();
        } else {
            handleAuth();
        }
    };

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <p className="login-label">Login or Sign up</p>
                <h1 className="login-title">SwitMe</h1>

                {step === 1 ? (
                    <>
                        <input
                            type="text"
                            placeholder="이름을 입력하세요"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="login-input"
                        />
                        <button className="login-button" type="submit" disabled={loading}>
                            {loading ? "처리 중..." : "Continue"}
                        </button>
                    </>
                ) : (
                    <>
                        <div className="user-info-row">
                            <span className="user-name-badge">{name}</span>
                            <button type="button" className="back-button" onClick={handleGoBack}>
                                이름 수정
                            </button>
                        </div>

                        {message && (
                            <p
                                className={`check-message ${
                                    isNewMember ? "new-user" : "existing-user"
                                }`}
                            >
                                {message}
                            </p>
                        )}

                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={
                                    isNewMember
                                        ? "새 비밀번호를 입력하세요"
                                        : "비밀번호를 입력하세요"
                                }
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="login-input"
                                autoFocus
                            />
                            <button
                                type="button"
                                className="password-toggle-button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "숨기기" : "보기"}
                            </button>
                        </div>

                        {isNewMember && (
                            <div className="password-input-container">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="비밀번호를 한 번 더 입력하세요"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="login-input"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? "숨기기" : "보기"}
                                </button>
                            </div>
                        )}

                        <button className="login-button" type="submit" disabled={loading}>
                            {loading
                                ? "처리 중..."
                                : isNewMember
                                ? "Sign up"
                                : "Login"}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}

export default Login;