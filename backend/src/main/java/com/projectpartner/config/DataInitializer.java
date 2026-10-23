package com.projectpartner.config;

import com.projectpartner.model.*;
import com.projectpartner.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private StudentSkillRepository studentSkillRepository;

    @Autowired
    private StudentProjectRepository studentProjectRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectRequiredSkillRepository requiredSkillRepository;

    @Autowired
    private TeamMemberRepository teamMemberRepository;

    @Autowired
    private TeamRequestRepository teamRequestRepository;

    @Autowired
    private ProjectMilestoneRepository milestoneRepository;

    @Autowired
    private ProjectTaskRepository taskRepository;

    @Autowired
    private TeamMessageRepository messageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            logger.info("Database already seeded. Skipping initial data loading.");
            return;
        }

        logger.info("Seeding initial database for ProjectPartner...");

        // 1. Seed Skills
        Map<String, Skill> skills = seedSkills();

        // 2. Seed Admin
        User admin = new User("admin@projectpartner.com", passwordEncoder.encode("admin123"), "Platform Administrator", Role.ROLE_ADMIN);
        userRepository.save(admin);

        // 3. Seed Students
        User alex = createStudent("alex@campus.edu", "password123", "Alex Chen",
                "Computer Science", "Stanford University", "B.Tech Senior", 2026, 18,
                "Passionate Full Stack engineer focused on resilient distributed backends and reactive modern web apps. Experienced in leading university hackathon teams.",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                "https://github.com/alexchen", "https://linkedin.com/in/alexchen",
                "WEB_DEVELOPMENT,CLOUD_DEVOPS");

        addSkillToStudent(alex, skills.get("React"), ProficiencyLevel.EXPERT, 3.0);
        addSkillToStudent(alex, skills.get("Java"), ProficiencyLevel.ADVANCED, 2.5);
        addSkillToStudent(alex, skills.get("Spring Boot"), ProficiencyLevel.ADVANCED, 2.0);
        addSkillToStudent(alex, skills.get("Docker"), ProficiencyLevel.INTERMEDIATE, 1.5);
        addSkillToStudent(alex, skills.get("MySQL"), ProficiencyLevel.ADVANCED, 2.0);

        addPastProjectToStudent(alex, "CloudCourse LMS", "University course management portal with automated grading", "React, Spring Boot, MySQL", "https://github.com/alexchen/cloud-lms", "https://cloud-lms-demo.io", "Dec 2025");

        User sarah = createStudent("sarah@campus.edu", "password123", "Sarah Jenkins",
                "Data Science & AI", "MIT", "Master of Science", 2026, 15,
                "Machine Learning researcher specializing in Generative AI, Retrieval-Augmented Generation (RAG), and Computer Vision. Looking for solid developers to ship real-world AI applications.",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                "https://github.com/sarahj-ai", "https://linkedin.com/in/sarahjenkins",
                "AI_MACHINE_LEARNING,DATA_SCIENCE");

        addSkillToStudent(sarah, skills.get("Python"), ProficiencyLevel.EXPERT, 3.5);
        addSkillToStudent(sarah, skills.get("PyTorch"), ProficiencyLevel.ADVANCED, 2.5);
        addSkillToStudent(sarah, skills.get("LangChain"), ProficiencyLevel.ADVANCED, 1.5);
        addSkillToStudent(sarah, skills.get("OpenCV"), ProficiencyLevel.INTERMEDIATE, 1.0);
        addSkillToStudent(sarah, skills.get("PostgreSQL"), ProficiencyLevel.INTERMEDIATE, 1.5);

        addPastProjectToStudent(sarah, "CampusBot RAG", "Intelligent campus handbook assistant using Llama 3 & ChromaDB", "Python, LangChain, FastAPI", "https://github.com/sarahj-ai/campusbot-rag", null, "Nov 2025");

        User marcus = createStudent("marcus@campus.edu", "password123", "Marcus Vance",
                "Software Engineering", "UC Berkeley", "B.S. Junior", 2027, 20,
                "High-performance systems enthusiast and cloud infrastructure tinkerer. Skilled in Kubernetes clusters, microservices, and database tuning.",
                "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
                "https://github.com/marcusvance", "https://linkedin.com/in/marcusvance",
                "CLOUD_DEVOPS,CYBERSECURITY,WEB_DEVELOPMENT");

        addSkillToStudent(marcus, skills.get("Java"), ProficiencyLevel.ADVANCED, 2.5);
        addSkillToStudent(marcus, skills.get("Go"), ProficiencyLevel.INTERMEDIATE, 1.5);
        addSkillToStudent(marcus, skills.get("Kubernetes"), ProficiencyLevel.INTERMEDIATE, 1.0);
        addSkillToStudent(marcus, skills.get("Docker"), ProficiencyLevel.ADVANCED, 2.0);
        addSkillToStudent(marcus, skills.get("PostgreSQL"), ProficiencyLevel.ADVANCED, 2.0);

        User priya = createStudent("priya@campus.edu", "password123", "Priya Patel",
                "Human-Computer Interaction", "University of Michigan", "B.Des Senior", 2026, 16,
                "UI/UX designer with strong frontend implementation skills. Passionate about accessible, micro-animated interfaces and design systems that users fall in love with.",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "https://github.com/priyadesign", "https://linkedin.com/in/priyapatel-ux",
                "UI_UX,WEB_DEVELOPMENT,MOBILE_APPS");

        addSkillToStudent(priya, skills.get("Figma"), ProficiencyLevel.EXPERT, 4.0);
        addSkillToStudent(priya, skills.get("React"), ProficiencyLevel.ADVANCED, 2.5);
        addSkillToStudent(priya, skills.get("Tailwind CSS"), ProficiencyLevel.EXPERT, 3.0);
        addSkillToStudent(priya, skills.get("Next.js"), ProficiencyLevel.INTERMEDIATE, 1.5);

        User david = createStudent("david@campus.edu", "password123", "David Kim",
                "Electrical & Computer Eng", "Georgia Tech", "B.S. Senior", 2026, 14,
                "Mobile app craftsman and IoT hobbyist. Have published 2 Flutter apps on Play Store. Excited about building cross-platform student productivity tools.",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "https://github.com/davidkim-dev", "https://linkedin.com/in/davidkim",
                "MOBILE_APPS,IOT_EMBEDDED");

        addSkillToStudent(david, skills.get("Flutter"), ProficiencyLevel.EXPERT, 3.0);
        addSkillToStudent(david, skills.get("Kotlin"), ProficiencyLevel.ADVANCED, 2.0);
        addSkillToStudent(david, skills.get("Python"), ProficiencyLevel.INTERMEDIATE, 1.5);
        addSkillToStudent(david, skills.get("MongoDB"), ProficiencyLevel.INTERMEDIATE, 1.0);

        User elena = createStudent("elena@campus.edu", "password123", "Elena Rostova",
                "Computational Linguistics", "Carnegie Mellon", "M.S. Student", 2026, 18,
                "NLP and deep learning researcher exploring multimodal foundation models, speech analysis, and automated paper summarization.",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
                "https://github.com/elena-nlp", "https://linkedin.com/in/elenarostova",
                "AI_MACHINE_LEARNING,DATA_SCIENCE");

        addSkillToStudent(elena, skills.get("Python"), ProficiencyLevel.EXPERT, 4.0);
        addSkillToStudent(elena, skills.get("TensorFlow"), ProficiencyLevel.ADVANCED, 2.5);
        addSkillToStudent(elena, skills.get("NLP"), ProficiencyLevel.EXPERT, 3.0);
        addSkillToStudent(elena, skills.get("PyTorch"), ProficiencyLevel.ADVANCED, 2.0);

        // 4. Seed Projects
        // Project 1: AI Campus Companion
        Project p1 = new Project("AI Campus Companion: Smart Navigation & Assistant",
                "An intelligent mobile & web assistant designed for incoming students. Features interactive AR building navigation, schedule optimization, and LLM-powered tutor bot trained on university syllabus.",
                ProjectDomain.AI_MACHINE_LEARNING, 4, sarah);
        p1.setGithubRepo("https://github.com/sarahj-ai/ai-campus-companion");
        p1.setStatus(ProjectStatus.RECRUITING);
        projectRepository.save(p1);

        teamMemberRepository.save(new TeamMember(p1, sarah, TeamRole.LEADER));
        requiredSkillRepository.save(new ProjectRequiredSkill(p1, skills.get("React"), ProficiencyLevel.ADVANCED, true));
        requiredSkillRepository.save(new ProjectRequiredSkill(p1, skills.get("Python"), ProficiencyLevel.ADVANCED, true));
        requiredSkillRepository.save(new ProjectRequiredSkill(p1, skills.get("LangChain"), ProficiencyLevel.INTERMEDIATE, false));
        requiredSkillRepository.save(new ProjectRequiredSkill(p1, skills.get("Figma"), ProficiencyLevel.INTERMEDIATE, false));

        // Milestones for P1
        ProjectMilestone m1 = milestoneRepository.save(new ProjectMilestone(p1, "Architecture Design & Dataset Curation", "Define API contracts, RAG pipeline architecture, and collect campus course catalog data", LocalDate.now().plusWeeks(2)));
        ProjectMilestone m2 = milestoneRepository.save(new ProjectMilestone(p1, "Core AI Model & API Implementation", "Train embeddings and build FastAPI endpoints for real-time question answering", LocalDate.now().plusWeeks(5)));
        ProjectMilestone m3 = milestoneRepository.save(new ProjectMilestone(p1, "Frontend Portal & User Testing", "Build sleek React web dashboard and test with 50 pilot student users", LocalDate.now().plusWeeks(8)));

        // Tasks for P1
        taskRepository.save(new ProjectTask(p1, "Setup vector database (Chroma/Pinecone)", "Configure schema and chunking strategies for campus PDFs", TaskPriority.HIGH, TaskStatus.DONE, LocalDate.now().minusDays(2)));
        taskRepository.save(new ProjectTask(p1, "Design UI mockups in Figma", "Draft wireframes for chat interface and campus map", TaskPriority.MEDIUM, TaskStatus.IN_PROGRESS, LocalDate.now().plusDays(4)));
        taskRepository.save(new ProjectTask(p1, "Implement Auth & User Sessions", "JWT authentication for students logging into companion", TaskPriority.URGENT, TaskStatus.TODO, LocalDate.now().plusDays(7)));
        taskRepository.save(new ProjectTask(p1, "Fine-tune LLM on syllabus FAQ", "Use LoRA fine-tuning for domain specific answers", TaskPriority.HIGH, TaskStatus.TODO, LocalDate.now().plusWeeks(2)));

        messageRepository.save(new TeamMessage(p1, sarah, "Welcome team! Looking forward to recruiting our React frontend lead this week."));

        // Project 2: CampusPay
        Project p2 = new Project("CampusPay: Fast Student Micro-Transactions",
                "A low-latency, secure peer-to-peer campus payment network for cafeteria, printing services, and student club dues with automatic split-bill functionality.",
                ProjectDomain.WEB_DEVELOPMENT, 4, alex);
        p2.setGithubRepo("https://github.com/alexchen/campuspay");
        p2.setStatus(ProjectStatus.RECRUITING);
        projectRepository.save(p2);

        teamMemberRepository.save(new TeamMember(p2, alex, TeamRole.LEADER));
        teamMemberRepository.save(new TeamMember(p2, marcus, TeamRole.BACKEND_DEV));

        requiredSkillRepository.save(new ProjectRequiredSkill(p2, skills.get("React"), ProficiencyLevel.ADVANCED, true));
        requiredSkillRepository.save(new ProjectRequiredSkill(p2, skills.get("Docker"), ProficiencyLevel.INTERMEDIATE, true));
        requiredSkillRepository.save(new ProjectRequiredSkill(p2, skills.get("MySQL"), ProficiencyLevel.INTERMEDIATE, false));

        ProjectMilestone p2m1 = milestoneRepository.save(new ProjectMilestone(p2, "Database Schema & Wallet Service", "Design ACID compliant transaction tables and ledger", LocalDate.now().plusWeeks(3)));
        p2m1.setStatus(MilestoneStatus.IN_PROGRESS);
        milestoneRepository.save(p2m1);

        taskRepository.save(new ProjectTask(p2, "Design Double-Entry Ledger System", "Create transaction audit trail and balance verification", TaskPriority.URGENT, TaskStatus.IN_PROGRESS, LocalDate.now().plusDays(3)));
        taskRepository.save(new ProjectTask(p2, "Create Payment Gateway Mock Webhooks", "Simulate stripe/sandbox callbacks for payments", TaskPriority.MEDIUM, TaskStatus.DONE, LocalDate.now().minusDays(1)));

        // Project 3: HealthSync
        Project p3 = new Project("HealthSync: Student Mental Health & Tele-Care",
                "An anonymous peer-support and counseling appointment scheduling platform for university wellness centers with mood tracking analytics.",
                ProjectDomain.WEB_DEVELOPMENT, 3, priya);
        p3.setStatus(ProjectStatus.IN_PROGRESS);
        projectRepository.save(p3);

        teamMemberRepository.save(new TeamMember(p3, priya, TeamRole.LEADER));
        teamMemberRepository.save(new TeamMember(p3, david, TeamRole.MOBILE_DEV));

        requiredSkillRepository.save(new ProjectRequiredSkill(p3, skills.get("React"), ProficiencyLevel.ADVANCED, true));
        requiredSkillRepository.save(new ProjectRequiredSkill(p3, skills.get("Flutter"), ProficiencyLevel.ADVANCED, true));

        // 5. Seed Team Requests
        // Join Request: Elena requested to join Sarah's AI project
        teamRequestRepository.save(new TeamRequest(
                p1,
                elena,
                sarah,
                RequestType.JOIN_REQUEST,
                TeamRole.AI_ML_ENGINEER,
                "Hi Sarah! I have deep expertise in NLP and PyTorch and would love to work on the syllabus conversational agent."
        ));

        // Invite Request: Alex invited Priya to join CampusPay as UI Designer
        teamRequestRepository.save(new TeamRequest(
                p2,
                alex,
                priya,
                RequestType.INVITE_REQUEST,
                TeamRole.UI_UX_DESIGNER,
                "Hey Priya, saw your amazing Figma and React portfolio! We need a lead designer for CampusPay's student payment app."
        ));

        logger.info("Database seeding completed successfully! Created 1 Admin, 6 Students, 3 Projects, and realistic requests/tasks.");
    }

    private User createStudent(String email, String rawPassword, String fullName,
                               String dept, String uni, String degree, int gradYear, int hours,
                               String bio, String avatar, String github, String linkedin, String domains) {
        User user = new User(email, passwordEncoder.encode(rawPassword), fullName, Role.ROLE_STUDENT);
        User savedUser = userRepository.save(user);

        StudentProfile profile = new StudentProfile(savedUser);
        profile.setDepartment(dept);
        profile.setUniversity(uni);
        profile.setDegreeLevel(degree);
        profile.setGraduationYear(gradYear);
        profile.setAvailableHoursPerWeek(hours);
        profile.setBio(bio);
        profile.setAvatarUrl(avatar);
        profile.setGithubUrl(github);
        profile.setLinkedinUrl(linkedin);
        profile.setPreferredDomains(domains);
        profileRepository.save(profile);

        return savedUser;
    }

    private void addSkillToStudent(User user, Skill skill, ProficiencyLevel level, Double experience) {
        StudentProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        if (profile != null && skill != null) {
            StudentSkill ss = new StudentSkill(profile, skill, level, experience);
            studentSkillRepository.save(ss);
        }
    }

    private void addPastProjectToStudent(User user, String title, String desc, String stack, String repo, String demo, String date) {
        StudentProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        if (profile != null) {
            StudentProject sp = new StudentProject(profile, title, desc, stack, repo, demo, date);
            studentProjectRepository.save(sp);
        }
    }

    private Map<String, Skill> seedSkills() {
        Map<String, Skill> map = new HashMap<>();

        List<Skill> skillList = Arrays.asList(
                // Frontend
                new Skill("React", SkillCategory.FRONTEND, "Modern UI components & state hooks"),
                new Skill("TypeScript", SkillCategory.FRONTEND, "Typed JavaScript superset"),
                new Skill("Vue.js", SkillCategory.FRONTEND, "Progressive frontend framework"),
                new Skill("Next.js", SkillCategory.FRONTEND, "SSR & Full-stack React framework"),
                new Skill("Tailwind CSS", SkillCategory.FRONTEND, "Utility-first CSS framework"),
                new Skill("HTML5/CSS3", SkillCategory.FRONTEND, "Core web standards"),

                // Backend
                new Skill("Java", SkillCategory.BACKEND, "Enterprise OOP language"),
                new Skill("Spring Boot", SkillCategory.BACKEND, "Java microservices & REST APIs"),
                new Skill("Python", SkillCategory.BACKEND, "Scripting, AI, and backend development"),
                new Skill("Django", SkillCategory.BACKEND, "High-level Python web framework"),
                new Skill("Node.js", SkillCategory.BACKEND, "JavaScript runtime on V8"),
                new Skill("Express", SkillCategory.BACKEND, "Node.js minimal web framework"),
                new Skill("Go", SkillCategory.BACKEND, "Fast compiled systems language"),

                // Database
                new Skill("MySQL", SkillCategory.DATABASE, "Relational SQL database"),
                new Skill("PostgreSQL", SkillCategory.DATABASE, "Advanced open source SQL database"),
                new Skill("MongoDB", SkillCategory.DATABASE, "Document NoSQL database"),
                new Skill("Redis", SkillCategory.DATABASE, "In-memory data store & cache"),

                // AI & ML
                new Skill("PyTorch", SkillCategory.AI_ML, "Deep learning and neural networks"),
                new Skill("TensorFlow", SkillCategory.AI_ML, "End-to-end ML platform"),
                new Skill("Scikit-learn", SkillCategory.AI_ML, "Traditional ML algorithms in Python"),
                new Skill("LangChain", SkillCategory.AI_ML, "LLM orchestration and RAG pipelines"),
                new Skill("OpenCV", SkillCategory.AI_ML, "Computer vision and image analysis"),
                new Skill("NLP", SkillCategory.AI_ML, "Natural language processing"),

                // Mobile
                new Skill("Flutter", SkillCategory.MOBILE, "Cross-platform mobile UI in Dart"),
                new Skill("React Native", SkillCategory.MOBILE, "Native mobile apps via React"),
                new Skill("Kotlin", SkillCategory.MOBILE, "Modern Android native development"),
                new Skill("Swift", SkillCategory.MOBILE, "iOS native development"),

                // DevOps & Cloud
                new Skill("Docker", SkillCategory.DEVOPS, "Containerization platform"),
                new Skill("Kubernetes", SkillCategory.DEVOPS, "Container orchestration"),
                new Skill("AWS", SkillCategory.DEVOPS, "Cloud computing services"),
                new Skill("GitHub Actions", SkillCategory.DEVOPS, "CI/CD automated pipelines"),

                // UI/UX & Design
                new Skill("Figma", SkillCategory.UI_UX, "Collaborative interface design & prototyping"),
                new Skill("UI Prototyping", SkillCategory.UI_UX, "Interactive user flow mockups")
        );

        for (Skill s : skillList) {
            Skill saved = skillRepository.save(s);
            map.put(s.getName(), saved);
        }

        return map;
    }
}
