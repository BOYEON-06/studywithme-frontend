import React, { useEffect, useState } from "react";
import "./Home.css";

import {
    createStudy,
    getMyStudyList,
    joinStudy,
    type StudyListItem,
} from "../api/studyAPI";

import {
    createManualAssignment,
    getAssignmentSubmissions,
    getMyAssignments,
    submitAssignment,
    type AssignmentSubmissionItem,
    type MyAssignmentItem,
} from "../api/assignmentAPI";

import Sidebar from "../component/Sidebar";
import Header from "../component/Header";
import HeroSection from "../component/HeroSection";
import AssignmentSection from "../component/AssignmentSection";
import TodoSection from "../component/TodoSection";
import NoticeSection from "../component/NoticeSection";
import ScheduleSection from "../component/ScheduleSection";
import ActivitySection from "../component/ActivitySection";
import CreateStudyModal from "../component/CreateStudyModal";
import JoinStudyModal from "../component/JoinStudyModal";
import AIAssignmentModal from "../component/AIAssignmentModal";
import ManualAssignmentModal from "../component/ManualAssignmentModal";
import SubmitAssignmentModal from "../component/SubmitAssignmentModal";
import SubmissionListModal from "../component/SubmissionListModal";

import type { Study } from "../types/study";
import type { Assignment } from "../types/assignment";
import type { Todo } from "../types/todo";
import type { Submission } from "../types/submission";

const Home: React.FC = () => {
    const [studies, setStudies] = useState<Study[]>([]);
    const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
    const [studyListLoading, setStudyListLoading] = useState(false);

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] =
        useState<Assignment | null>(null);
    const [assignmentLoading, setAssignmentLoading] = useState(false);

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [submissionLoading, setSubmissionLoading] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isAIAssignmentModalOpen, setIsAIAssignmentModalOpen] =
        useState(false);
    const [isManualAssignmentModalOpen, setIsManualAssignmentModalOpen] =
        useState(false);
    const [isSubmitAssignmentModalOpen, setIsSubmitAssignmentModalOpen] =
        useState(false);
    const [isSubmissionListModalOpen, setIsSubmissionListModalOpen] =
        useState(false);

    const todos: Todo[] = [
        { id: 1, text: "AI 퀴즈 1회차 풀기", checked: true },
        { id: 2, text: "팀 프로젝트 회의록 확인", checked: true },
        { id: 3, text: "백엔드 API 명세 읽기", checked: false },
        { id: 4, text: "웹소켓 채팅 구조 정리", checked: false },
    ];

    const notices = [
        "금요일 오후 7시 정기 회의 진행",
        "이번 주 공동 프로젝트 중간 점검 제출",
        "AI 자동 퀴즈 기능 시범 운영 예정",
    ];

    const schedules = [
        { title: "스터디 주간 회의", time: "오늘 19:00" },
        { title: "과제 마감", time: "내일 23:59" },
        { title: "프로젝트 발표 준비", time: "금요일 18:00" },
    ];

    const convertStudy = (study: StudyListItem): Study => {
        const savedUser = localStorage.getItem("user");
        const user = savedUser ? JSON.parse(savedUser) : null;

        return {
            id: study.id,
            name: study.title,
            role: user?.name === study.creatorName ? "스터디장" : "스터디원",
            description: study.description,
            inviteCode: study.inviteCode,
            creatorName: study.creatorName,
        };
    };

    const convertAssignment = (assignment: MyAssignmentItem): Assignment => {
        let status: Assignment["status"] = "미제출";

        if (assignment.isExpired) {
            status = "마감";
        } else if (assignment.isSubmitted) {
            status = "제출완료";
        }

        return {
            id: assignment.assignmentId,
            studyId: assignment.studyId,
            title: assignment.title,
            content: assignment.content,
            due: assignment.dueDate,
            status,
        };
    };

    const convertSubmission = (
        submission: AssignmentSubmissionItem
    ): Submission => {
        return {
            submissionId: submission.submissionId,
            memberId: submission.memberId,
            memberName: submission.memberName,
            content: submission.content,
            submittedAt: submission.submittedAt,
        };
    };

    const fetchMyStudyList = async () => {
        try {
            setStudyListLoading(true);

            const data = await getMyStudyList();
            const convertedStudies = data.map(convertStudy);

            setStudies(convertedStudies);

            if (convertedStudies.length > 0) {
                setSelectedStudy((prev) => prev ?? convertedStudies[0]);
            } else {
                setSelectedStudy(null);
            }
        } catch (error) {
            console.error(error);
            alert("내 스터디 목록을 불러오지 못했습니다. 로그인 상태를 확인해주세요.");
        } finally {
            setStudyListLoading(false);
        }
    };

    const fetchMyAssignments = async () => {
        try {
            setAssignmentLoading(true);

            const data = await getMyAssignments();
            const convertedAssignments = data.map(convertAssignment);

            setAssignments(convertedAssignments);
        } catch (error) {
            console.error(error);
            alert("과제 목록을 불러오지 못했습니다. 로그인 상태를 확인해주세요.");
        } finally {
            setAssignmentLoading(false);
        }
    };

    const fetchAssignmentSubmissions = async (assignment: Assignment) => {
        if (!selectedStudy) return;

        try {
            setSubmissionLoading(true);

            const data = await getAssignmentSubmissions(
                selectedStudy.id,
                assignment.id
            );

            setSubmissions(data.map(convertSubmission));
        } catch (error) {
            console.error(error);
            alert("제출 목록을 불러오지 못했습니다. 로그인 상태 또는 권한을 확인해주세요.");
        } finally {
            setSubmissionLoading(false);
        }
    };

    useEffect(() => {
        fetchMyStudyList();
        fetchMyAssignments();
    }, []);

    const selectedAssignments = selectedStudy
        ? assignments.filter((assignment) => assignment.studyId === selectedStudy.id)
        : [];

    const handleCreateStudy = async (title: string, description: string) => {
        const result = await createStudy({
            title,
            description,
        });

        alert(`${result.message}\n초대코드: ${result.inviteCode}`);

        await fetchMyStudyList();
    };

    const handleJoinStudy = async (inviteCode: string) => {
        const result = await joinStudy({
            inviteCode,
        });

        alert(result.message);

        await fetchMyStudyList();
        await fetchMyAssignments();
    };

    const handleShareInviteCode = async () => {
        if (!selectedStudy) {
            alert("스터디를 먼저 선택하세요.");
            return;
        }

        if (!selectedStudy.inviteCode) {
            alert("초대코드가 없습니다.");
            return;
        }

        try {
            await navigator.clipboard.writeText(selectedStudy.inviteCode);
            alert(`초대코드가 복사되었습니다.\n${selectedStudy.inviteCode}`);
        } catch (error) {
            console.error(error);
            alert(`초대코드: ${selectedStudy.inviteCode}`);
        }
    };

    const checkStudyLeader = () => {
        if (!selectedStudy) {
            alert("스터디를 먼저 선택하세요.");
            return false;
        }

        if (selectedStudy.role !== "스터디장") {
            alert("스터디장만 사용할 수 있는 기능입니다.");
            return false;
        }

        return true;
    };

    const handleOpenAIAssignmentModal = () => {
        if (!checkStudyLeader()) return;
        setIsAIAssignmentModalOpen(true);
    };

    const handleOpenManualAssignmentModal = () => {
        if (!checkStudyLeader()) return;
        setIsManualAssignmentModalOpen(true);
    };

    const handleCreateManualAssignment = async (
        title: string,
        content: string
    ) => {
        if (!selectedStudy) return;

        const result = await createManualAssignment(selectedStudy.id, {
            title,
            content,
        });

        alert(`${result.message}\n마감일: ${result.dueDate}`);

        await fetchMyAssignments();
    };

    const handleOpenSubmitModal = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setIsSubmitAssignmentModalOpen(true);
    };

    const handleSubmitAssignment = async (content: string) => {
        if (!selectedStudy || !selectedAssignment) return;

        const result = await submitAssignment(
            selectedStudy.id,
            selectedAssignment.id,
            { content }
        );

        alert(result.message);

        await fetchMyAssignments();
    };

    const handleOpenSubmissionListModal = async (assignment: Assignment) => {
        if (!checkStudyLeader()) return;

        setSelectedAssignment(assignment);
        setIsSubmissionListModalOpen(true);
        await fetchAssignmentSubmissions(assignment);
    };

    return (
        <div className="home">
            <Sidebar
                studies={studies}
                selectedStudy={selectedStudy}
                loading={studyListLoading}
                onSelectStudy={setSelectedStudy}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onOpenJoinModal={() => setIsJoinModalOpen(true)}
            />

            <main className="main-content">
                <Header
                    selectedStudy={selectedStudy}
                    onShareInviteCode={handleShareInviteCode}
                    onOpenAIAssignmentModal={handleOpenAIAssignmentModal}
                    onOpenManualAssignmentModal={handleOpenManualAssignmentModal}
                />

                <HeroSection
                    selectedStudy={selectedStudy}
                    assignmentCount={selectedAssignments.length}
                />

                <section className="content-grid">
                    <AssignmentSection
                        assignments={selectedAssignments}
                        loading={assignmentLoading}
                        isLeader={selectedStudy?.role === "스터디장"}
                        onOpenSubmitModal={handleOpenSubmitModal}
                        onOpenSubmissionListModal={handleOpenSubmissionListModal}
                    />

                    <TodoSection todos={todos} />
                    <NoticeSection notices={notices} />
                    <ScheduleSection schedules={schedules} />
                    <ActivitySection />
                </section>
            </main>

            {isCreateModalOpen && (
                <CreateStudyModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreateStudy}
                />
            )}

            {isJoinModalOpen && (
                <JoinStudyModal
                    onClose={() => setIsJoinModalOpen(false)}
                    onJoin={handleJoinStudy}
                />
            )}

            {isAIAssignmentModalOpen && (
                <AIAssignmentModal
                    onClose={() => setIsAIAssignmentModalOpen(false)}
                />
            )}

            {isManualAssignmentModalOpen && (
                <ManualAssignmentModal
                    onClose={() => setIsManualAssignmentModalOpen(false)}
                    onCreate={handleCreateManualAssignment}
                />
            )}

            {isSubmitAssignmentModalOpen && selectedAssignment && (
                <SubmitAssignmentModal
                    assignment={selectedAssignment}
                    onClose={() => setIsSubmitAssignmentModalOpen(false)}
                    onSubmit={handleSubmitAssignment}
                />
            )}

            {isSubmissionListModalOpen && selectedAssignment && (
                <SubmissionListModal
                    assignment={selectedAssignment}
                    submissions={submissions}
                    loading={submissionLoading}
                    onClose={() => setIsSubmissionListModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Home;