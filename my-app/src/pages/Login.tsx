import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authContinue } from "../api/authAPI";
import "./Login.css";

function Login() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleAuth = async () => {
        if (!name.trim()) {
            alert("이름을 입력하세요.");
            return;
        }

        if (!password.trim()) {
            alert("비밀번호를 입력하세요.");
            return;
        }

        try {
            setLoading(true);

            const data = await authContinue({
                name,
                password,
            });

            localStorage.setItem("user", JSON.stringify(data.user));

            alert(data.message || "로그인 성공");
            navigate("/home");
        } catch (error) {
            console.error(error);
            alert("로그인 또는 회원가입에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleAuth();
    };

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <p className="login-label">Login or Sign up</p>
                <h1 className="login-title">SwitMe</h1>

                <input
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="login-input"
                />

                <input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                />

                <button className="login-button" type="submit" disabled={loading}>
                    {loading ? "처리 중..." : "Continue"}
                </button>
            </form>
        </div>
    );
}

export default Login;