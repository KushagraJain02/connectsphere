// ConnectSphere Data Seeding Script
// Usage: node seed.js
// Make sure all Docker containers are running first!

const BASE_URL = 'http://localhost:8080/api';

// ─── Helper functions ─────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function request(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        const text = await res.text();
        try { return JSON.parse(text); } catch { return text; }
    } catch (e) {
        return { error: e.message };
    }
}

const post = (path, body, token) => request('POST', path, body, token);
const put  = (path, body, token) => request('PUT',  path, body, token);
const get  = (path, token)       => request('GET',  path, null, token);

async function postForm(path, formData, token) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData,
        });
        const text = await res.text();
        try { return JSON.parse(text); } catch { return text; }
    } catch (e) {
        return { error: e.message };
    }
}

// ─── Users ────────────────────────────────────────────────
const USERS = [
    {
        fullName: 'Rahul Sharma',
        email: 'rahul@connectsphere.com',
        password: 'password123',
        role: 'USER',
        headline: 'Senior Backend Developer | Spring Boot · Microservices · Kafka',
        bio: 'Passionate backend engineer with 6 years of experience building scalable distributed systems. I love working with microservices, event-driven architectures, and cloud-native technologies. Always looking to learn and share knowledge.',
        location: 'Pune, Maharashtra',
        skills: ['Java', 'Spring Boot', 'Microservices', 'Apache Kafka', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis'],
        experiences: [
            {
                company: 'TechCorp India',
                role: 'Senior Backend Developer',
                startDate: '2021-06',
                endDate: '',
                description: 'Leading a team of 5 engineers building microservices for a fintech platform handling 2M+ daily transactions. Designed Kafka-based event streaming pipeline reducing latency by 60%.',
            },
            {
                company: 'Infosys',
                role: 'Software Engineer',
                startDate: '2018-07',
                endDate: '2021-05',
                description: 'Developed REST APIs and integrated third-party payment gateways for banking clients. Improved API response time by 40% through Redis caching.',
            },
        ],
    },
    {
        fullName: 'Priya Patel',
        email: 'priya@connectsphere.com',
        password: 'password123',
        role: 'USER',
        headline: 'Full Stack Developer | React · Node.js · AWS',
        bio: 'Full stack developer who loves building beautiful, performant web applications. Experienced in React, Node.js, and cloud deployments on AWS. Passionate about great user experiences and clean code.',
        location: 'Bangalore, Karnataka',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB', 'GraphQL', 'Tailwind CSS', 'Docker'],
        experiences: [
            {
                company: 'Flipkart',
                role: 'Full Stack Developer',
                startDate: '2022-03',
                endDate: '',
                description: 'Building seller dashboard features serving 300K+ sellers on the platform. Led migration from REST to GraphQL reducing payload size by 70%.',
            },
            {
                company: 'Wipro',
                role: 'Frontend Developer',
                startDate: '2019-08',
                endDate: '2022-02',
                description: 'Developed responsive UI components for enterprise banking clients. Introduced Storybook for component documentation, adopted by 3 other teams.',
            },
        ],
    },
    {
        fullName: 'Arjun Mehta',
        email: 'arjun@connectsphere.com',
        password: 'password123',
        role: 'USER',
        headline: 'DevOps Engineer | Kubernetes · CI/CD · Terraform',
        bio: 'DevOps engineer with a passion for automation, infrastructure-as-code, and building rock-solid CI/CD pipelines. AWS certified professional. I believe infrastructure should be boring — predictable, reliable, and fully automated.',
        location: 'Hyderabad, Telangana',
        skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Jenkins', 'GitHub Actions', 'Prometheus', 'Grafana'],
        experiences: [
            {
                company: 'Amazon',
                role: 'DevOps Engineer',
                startDate: '2020-01',
                endDate: '',
                description: 'Managing Kubernetes clusters across 3 AWS regions, handling auto-scaling for Black Friday traffic spikes of 10x normal load. Reduced deployment time from 45min to 8min.',
            },
            {
                company: 'HCL Technologies',
                role: 'Cloud Engineer',
                startDate: '2017-06',
                endDate: '2019-12',
                description: 'Migrated legacy on-premise infrastructure to AWS for 5 enterprise clients, reducing infrastructure costs by an average of 40%.',
            },
        ],
    },
    {
        fullName: 'Sneha Desai',
        email: 'sneha@connectsphere.com',
        password: 'password123',
        role: 'USER',
        headline: 'Machine Learning Engineer | Python · TensorFlow · LLMs',
        bio: 'ML engineer specialising in NLP and large language models. Currently working on AI-powered recommendation systems. Speaker at PyCon India 2023. I believe AI should be explainable, fair, and actually useful.',
        location: 'Mumbai, Maharashtra',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'LLMs', 'FastAPI', 'Apache Spark', 'SQL'],
        experiences: [
            {
                company: 'Swiggy',
                role: 'ML Engineer',
                startDate: '2021-09',
                endDate: '',
                description: 'Building and deploying recommendation models that drive 35% of order volume. Reduced model inference latency from 120ms to 18ms using model distillation and ONNX.',
            },
            {
                company: 'Tata Consultancy Services',
                role: 'Data Scientist',
                startDate: '2018-07',
                endDate: '2021-08',
                description: 'Developed predictive models for supply chain optimization for 3 major retail clients. Published 2 internal research papers on demand forecasting.',
            },
        ],
    },
    {
        fullName: 'Vikram Nair',
        email: 'vikram@connectsphere.com',
        password: 'password123',
        role: 'USER',
        headline: 'Android Developer | Kotlin · Jetpack Compose · MVVM',
        bio: 'Android developer with 5 years of experience building consumer apps. Created apps with 1M+ combined downloads on Play Store. Enthusiast of clean architecture, test-driven development, and performance optimisation.',
        location: 'Chennai, Tamil Nadu',
        skills: ['Kotlin', 'Android', 'Jetpack Compose', 'MVVM', 'Coroutines', 'Room', 'Retrofit', 'Firebase'],
        experiences: [
            {
                company: 'Paytm',
                role: 'Senior Android Developer',
                startDate: '2020-04',
                endDate: '',
                description: 'Core team member for Paytm Money investment app, reaching 5M+ active users. Led migration to Jetpack Compose reducing UI code by 45%.',
            },
            {
                company: 'Zoho',
                role: 'Android Developer',
                startDate: '2018-01',
                endDate: '2020-03',
                description: 'Developed Zoho CRM mobile application used by 50K+ businesses worldwide. Implemented offline-first architecture using Room and WorkManager.',
            },
        ],
    },
    {
        fullName: 'Amit Desai',
        email: 'do',
        password: 'password123',
        role: 'RECRUITER',
        headline: 'Senior Technical Recruiter | TechCorp India',
        bio: 'Helping top engineering talent find their dream roles at TechCorp India. 8 years of technical recruiting experience across backend, frontend, and DevOps. Let\'s connect if you\'re open to exciting opportunities!',
        location: 'Pune, Maharashtra',
        skills: ['Technical Recruiting', 'Talent Acquisition', 'Java Ecosystem', 'Cloud Technologies'],
        experiences: [
            {
                company: 'TechCorp India',
                role: 'Senior Technical Recruiter',
                startDate: '2019-03',
                endDate: '',
                description: 'Hired 200+ engineers across backend, frontend, and DevOps teams. Average time-to-hire reduced from 45 to 28 days through process improvements.',
            },
        ],
    },
    {
        fullName: 'Neha Kapoor',
        email: 'neha@startupxyz.com',
        password: 'password123',
        role: 'RECRUITER',
        headline: 'HR Manager | StartupXYZ | Building High-Performance Teams',
        bio: 'HR Manager at StartupXYZ, a fast-growing fintech startup backed by Sequoia. Looking for passionate engineers who want to make a real impact on personal finance for millions of Indians.',
        location: 'Bangalore, Karnataka',
        skills: ['Recruitment', 'HR Management', 'Fintech', 'Startup Culture', 'Employer Branding'],
        experiences: [
            {
                company: 'StartupXYZ',
                role: 'HR Manager',
                startDate: '2021-01',
                endDate: '',
                description: 'Scaled engineering team from 10 to 60 in 18 months during Series B growth phase. Built structured interview process and onboarding program from scratch.',
            },
        ],
    },
];

// ─── Posts ────────────────────────────────────────────────
const POSTS = [
    {
        authorIndex: 0,
        content: `🚀 Just launched ConnectSphere — a production-grade LinkedIn clone built from scratch!

Tech stack:
• 8 Spring Boot microservices
• Apache Kafka for async event streaming
• Redis for caching and Pub/Sub messaging
• React + Tailwind CSS for the frontend
• Docker + Kubernetes for deployment
• PostgreSQL for persistent storage

This project taught me more about distributed systems than any course ever could. The Kafka implementation alone took 3 weeks to get right — handling exactly-once delivery across services was a real challenge.

Happy to do a deep dive on the architecture — drop a comment below 👇

#SpringBoot #Microservices #Kafka #Docker #Kubernetes`,
    },
    {
        authorIndex: 1,
        content: `💡 Hot take: CSS is harder than most backend languages. Change my mind.

After 5 years of coding, I still reach for Stack Overflow when centering a div perfectly. Meanwhile I can design a microservices architecture in my sleep.

Frontend developers don't get enough credit. The attention to detail, cross-browser compatibility, accessibility, performance — it's incredibly complex work.

The next time someone says "you're just a frontend dev" — remember that they couldn't build what you build.

#Frontend #WebDev #CSS #React`,
    },
    {
        authorIndex: 2,
        content: `🎯 Kubernetes tip that will save you from a 3am incident:

Always set resource requests AND limits on your pods. Without them:

❌ One memory-hungry pod can starve all others on the node
❌ The node crashes under unexpected load  
❌ HPA makes wrong scaling decisions
❌ You get paged at 3am on a Friday

A simple resources block takes 5 minutes to configure and prevents hours of outage debugging.

I learned this the hard way during Black Friday. Don't make my mistake 😅

#Kubernetes #DevOps #SRE #K8s`,
    },
    {
        authorIndex: 3,
        content: `🤖 We just deployed our new recommendation model to production. Here are the week 1 results:

📈 Click-through rate: +23%
📈 Average order value: +18%
📈 User engagement: +31%
📈 Discovery of new restaurants: +44%

The key insight? We moved from pure collaborative filtering to a hybrid model:
→ Collaborative filtering for users with history
→ Content-based filtering for new users (cold start)
→ Neural CF layer combining both signals

The cold-start problem was our biggest challenge — about 15% of our users are new each day.

Happy to write a detailed technical blog post if people are interested! Comment below 👇

#MachineLearning #RecommendationSystems #Python #TensorFlow`,
    },
    {
        authorIndex: 4,
        content: `📱 We just crossed 1 MILLION downloads on the Play Store! 🎉

A year ago I was debugging a memory leak that crashed the app on startup. Today — 1 million users trusting us with their finances.

The biggest technical lesson: Jetpack Compose is genuinely amazing for complex UIs. Switched from XML layouts 8 months ago and never looked back. The development speed increased by roughly 40% and the code is so much cleaner.

The biggest product lesson: Listen to your 1-star reviews. Every single complaint is a gift.

Thank you to every user who downloaded, reviewed, and sent feedback. This community means everything. 🙏

#Android #JetpackCompose #Kotlin #Mobiledev`,
    },
    {
        authorIndex: 1,
        content: `🔥 Unpopular opinion: Most "microservices" in production are actually distributed monoliths.

If your services are:
• Sharing a database (even with different schemas)
• Calling each other synchronously for every operation  
• Always deployed together as a single unit
• Sharing a codebase or libraries tightly

...you don't have microservices. You have a monolith with extra failure points and extra operational complexity.

True microservices are independently deployable, own their data completely, and communicate asynchronously where possible. It's genuinely HARD to do right — and that's okay.

The real question to ask: does the complexity of microservices serve your actual business needs right now?

Agree or disagree? 👇`,
    },
    {
        authorIndex: 2,
        content: `Quick CI/CD tip that caught 3 production incidents last month:

Add Terraform plan output as a required CI check on every PR that touches infrastructure. We found:

🔴 A developer manually added an S3 bucket policy via console — not tracked anywhere
🔴 A security group rule was modified directly to "just test something" and never reverted
🔴 An IAM role had extra permissions that nobody remembered adding

Infrastructure as Code only works if EVERYTHING goes through code. Zero exceptions. No console cowboys 🤠❌

Tools I use:
→ Terraform plan in CI (required status check)
→ Checkov for security scanning
→ Infracost to flag unexpected cost increases

#DevOps #Terraform #IaC #CloudSecurity #AWS`,
    },
    {
        authorIndex: 0,
        content: `📚 Essential reading list for backend engineers in 2025:

1. "Designing Data-Intensive Applications" — Martin Kleppmann
   → Absolute must-read. Changed how I think about databases and distributed systems forever.

2. "System Design Interview Vol 1 & 2" — Alex Xu
   → Best practical guide to large-scale system design.

3. "Clean Architecture" — Robert C. Martin
   → Opinionated but the principles are solid. Read critically.

4. "Building Microservices" — Sam Newman
   → The definitive guide if you're doing microservices seriously.

5. "Database Internals" — Alex Petrov
   → For when you want to really understand what's happening under the hood.

The first book alone is worth more than most courses I've taken. What would you add? 📖

#SoftwareEngineering #Books #BackendDevelopment #Learning`,
    },
];

// ─── Jobs ─────────────────────────────────────────────────
const JOBS = [
    {
        recruiterIndex: 5,
        title: 'Senior Backend Engineer — Microservices Platform',
        description: 'We are looking for a Senior Backend Engineer to join our core platform team at TechCorp India. You will design, build, and own high-performance microservices handling millions of requests per day across our fintech products.\n\nWhat you will do:\n• Design and implement new microservices using Spring Boot\n• Work with Kafka for event-driven architecture\n• Collaborate with Platform team on infrastructure improvements\n• Mentor junior engineers and participate in architecture reviews\n• Own services end-to-end from design to production deployment\n\nWhat we offer:\n• Competitive salary + equity\n• Fully remote-friendly\n• Learning budget of ₹1L per year\n• Top-of-the-line MacBook Pro',
        companyName: 'TechCorp India',
        location: 'Pune, Maharashtra',
        jobType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        salaryRange: '25-40 LPA',
        requiredSkills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'Docker', 'PostgreSQL'],
    },
    {
        recruiterIndex: 5,
        title: 'DevOps Engineer — Platform & Infrastructure',
        description: 'Join our Platform Engineering team to build and maintain the infrastructure that powers TechCorp India\'s suite of products used by millions of users.\n\nYou will be responsible for:\n• Managing and scaling our Kubernetes clusters on AWS\n• Building and improving CI/CD pipelines for 20+ microservices\n• Infrastructure-as-Code using Terraform\n• Setting up monitoring, alerting, and on-call procedures\n• Ensuring 99.95% uptime SLA across all production services\n\nYou will have the opportunity to build infrastructure from the ground up and have a massive impact on engineering productivity.',
        companyName: 'TechCorp India',
        location: 'Pune, Maharashtra',
        jobType: 'FULL_TIME',
        experienceLevel: 'MID',
        salaryRange: '18-28 LPA',
        requiredSkills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins', 'GitHub Actions'],
    },
    {
        recruiterIndex: 6,
        title: 'Full Stack Developer — Consumer Fintech Product',
        description: 'StartupXYZ is building the next generation of personal finance tools for India. We are Series B funded (Sequoia), growing fast, and looking for a Full Stack Developer to help build our core product.\n\nThis is a high-impact role — you will work directly with founders and have enormous influence on product direction. We ship fast, learn fast, and celebrate failures as much as wins.\n\nTech stack: React, Node.js, TypeScript, MongoDB, AWS, GraphQL\n\nWhat makes StartupXYZ different:\n• We obsess over user experience\n• Zero micromanagement — full ownership\n• Unlimited learning budget\n• ESOP from day one',
        companyName: 'StartupXYZ',
        location: 'Bangalore, Karnataka',
        jobType: 'FULL_TIME',
        experienceLevel: 'MID',
        salaryRange: '15-22 LPA',
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'GraphQL'],
    },
    {
        recruiterIndex: 6,
        title: 'Machine Learning Engineer — AI Recommendations',
        description: 'Help us build AI-powered financial recommendation systems that personalise the experience for 500K+ users and growing.\n\nYou will own the full ML lifecycle at StartupXYZ:\n• Data collection and feature engineering pipelines\n• Model training, evaluation, and A/B testing\n• Production deployment and monitoring\n• Research into new approaches (LLMs, embeddings, etc.)\n\nWe believe ML should directly serve users — every model you build will have measurable impact on real people\'s financial decisions.\n\nThis is a remote-first role with quarterly team meetups in Bangalore.',
        companyName: 'StartupXYZ',
        location: 'Remote',
        jobType: 'REMOTE',
        experienceLevel: 'MID',
        salaryRange: '20-30 LPA',
        requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'FastAPI', 'AWS'],
    },
    {
        recruiterIndex: 5,
        title: 'Senior Android Developer — Consumer App',
        description: 'Build the next version of our consumer Android app used by 2M+ users across India.\n\nYou will work on:\n• New features using Jetpack Compose\n• Performance improvements and crash reduction\n• Architecture refactoring toward clean MVVM\n• Collaborating closely with our iOS and backend teams\n\nWe care deeply about:\n• App performance (startup time < 1.5s is a hard requirement)\n• Accessibility (we serve users across all income levels)\n• Code quality and comprehensive testing\n\nPrevious experience shipping apps with significant Play Store ratings preferred.',
        companyName: 'TechCorp India',
        location: 'Pune, Maharashtra',
        jobType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        salaryRange: '20-32 LPA',
        requiredSkills: ['Kotlin', 'Android', 'Jetpack Compose', 'MVVM', 'Coroutines', 'Firebase'],
    },
];

// ─── Conversations ────────────────────────────────────────
const CONVERSATIONS = [
    {
        fromIndex: 0,
        toIndex: 1,
        messages: [
            { sender: 0, text: "Hey Priya! I came across your profile — your work at Flipkart is really impressive. The GraphQL migration you mentioned sounds like a huge win. Would love to connect!" },
            { sender: 1, text: "Hi Rahul! Thanks so much 😊 Your ConnectSphere project is amazing. Building 8 microservices from scratch with Kafka is no joke — that must have been a journey!" },
            { sender: 0, text: "Ha thank you! It was definitely a beast. The Kafka part alone took about 3 weeks to get right — especially handling message ordering across services. Are you working on anything interesting at Flipkart right now?" },
            { sender: 1, text: "Yes! We're rebuilding the seller dashboard with a micro-frontend architecture using Webpack 5 Module Federation. Lots of challenges but super exciting. Each team owns their own bundle now." },
            { sender: 0, text: "Oh that's fascinating! I've been reading about Module Federation lately. How are you handling shared state and authentication across the micro-frontends?" },
            { sender: 1, text: "Great question — we use a shared auth context published as a federated module, and a custom event bus for cross-MFE communication. Happy to share our architecture doc if you're interested!" },
            { sender: 0, text: "That would be incredibly helpful! Yes please. I'm thinking of exploring MFE for a future project." },
        ],
    },
    {
        fromIndex: 0,
        toIndex: 2,
        messages: [
            { sender: 0, text: "Arjun — just read your post about Kubernetes resource limits. That tip literally saved me from a production incident this week. Our analytics pod was memory-leaking and started starving other pods!" },
            { sender: 2, text: "Glad it helped! Yeah that lesson cost me a very painful 2am Friday incident 😅 What happened on your end exactly?" },
            { sender: 0, text: "Our ML pipeline pod had no memory limit set. It kept consuming more and more processing a large batch job until it OOM-killed the entire node. Took down 3 other services with it." },
            { sender: 2, text: "Classic cascade failure! The worst part about Kubernetes issues is they always seem to happen at 2am on a Friday. Some kind of cosmic law 😂" },
            { sender: 0, text: "100%! Hey — we're setting up monitoring for our clusters. Any recommendations for a solid observability stack?" },
            { sender: 2, text: "Prometheus + Grafana for metrics is the standard. Add Loki for log aggregation and Tempo for distributed tracing. Together they give you the full picture. I can share our Helm charts and Grafana dashboards if that would help?" },
            { sender: 0, text: "That would be amazing! Yes please. We're setting up from scratch so any working configs would save us days." },
            { sender: 2, text: "I'll package them up and share. One thing to also add early: set up PagerDuty or OpsGenie integration from day one. Alertmanager -> PagerDuty is 2 hours of work that will save you from sleeping through incidents." },
        ],
    },
    {
        fromIndex: 3,
        toIndex: 1,
        messages: [
            { sender: 3, text: "Hi Priya! Your profile mentions working with GraphQL at Flipkart. I'm exploring it for our ML model serving API and could use some advice. Is this a good time to ask a few questions?" },
            { sender: 1, text: "Hey Sneha! Of course, happy to help! GraphQL is a great fit for ML APIs actually — what's your current setup?" },
            { sender: 3, text: "Currently REST with FastAPI. The problem is our recommendation endpoints return massive payloads (full item metadata) but clients only need 3-4 fields each time. It's slowing down our mobile clients badly." },
            { sender: 1, text: "That's the perfect GraphQL use case! With GraphQL, clients request exactly the fields they need — nothing more. You'd see massive payload reduction, especially on mobile." },
            { sender: 3, text: "That's exactly what I need. Should I rebuild the FastAPI service or add a GraphQL layer on top?" },
            { sender: 1, text: "I'd add Strawberry (Python GraphQL library) on top of your existing FastAPI — it integrates natively and you don't need to rewrite anything. Use DataLoader for batching to avoid N+1 query problems." },
            { sender: 3, text: "Strawberry looks perfect! One more question — how do you handle auth in GraphQL? We have multiple user roles." },
            { sender: 1, text: "JWT in HTTP headers, validated in the GraphQL context function. Then use custom decorators or middleware on resolvers to check permissions. I can share a code snippet with role-based auth if helpful?" },
        ],
    },
    {
        fromIndex: 2,
        toIndex: 4,
        messages: [
            { sender: 2, text: "Vikram! Congrats on 1M downloads — that's a massive milestone! 🎉 I saw your post about Jetpack Compose. We're actually considering it for an internal tool at Amazon. How's the learning curve?" },
            { sender: 4, text: "Thank you so much Arjun! The milestone still doesn't feel real 😄 Jetpack Compose learning curve — honestly steeper than I expected for the first 2 weeks, then dramatically faster after that." },
            { sender: 2, text: "What was the hardest part to get your head around?" },
            { sender: 4, text: "State management. Coming from XML/ViewModel, the mental model of 'state flows down, events flow up' takes time to click. But once it does, everything just makes sense. The recomposition model is elegant once you understand it." },
            { sender: 2, text: "Makes sense. How does it perform compared to XML views for complex UIs?" },
            { sender: 4, text: "For simple screens, similar or slightly slower on older devices. For complex animated UIs, Compose is actually faster because you're not inflating XML. The key is understanding when recomposition happens and keeping it minimal." },
        ],
    },
];

// ─── Applications ─────────────────────────────────────────
const APPLICATIONS = [
    {
        userIndex: 0,
        jobIndex: 0,
        coverLetter: "I am very excited about this Senior Backend Engineer role at TechCorp India. I have 6 years of Java and Spring Boot experience, and I currently lead a team of 5 engineers building microservices for a fintech platform handling 2M+ daily transactions. I recently built ConnectSphere — a full LinkedIn-clone with 8 Spring Boot microservices, Kafka, and Redis — which demonstrates exactly the skills this role requires. I would love to bring this experience to your platform team.",
    },
    {
        userIndex: 0,
        jobIndex: 1,
        coverLetter: "While my primary expertise is backend development, I have extensive hands-on experience with Docker and Kubernetes from running our production cluster at TechCorp. I manage deployments for our 8-service platform and have implemented GitOps workflows using ArgoCD. This DevOps role aligns perfectly with my goal to deepen my infrastructure skills alongside my backend background.",
    },
    {
        userIndex: 1,
        jobIndex: 2,
        coverLetter: "I am a strong fit for this Full Stack Developer role at StartupXYZ! I have 4 years of React experience building features for Flipkart's seller platform (300K+ users), and I've been working with Node.js for our BFF API layer for the past year. I'm genuinely passionate about fintech and personal finance — I've been using Splitwise and Zerodha for years and have thoughts on how they could be much better. Would love to bring that user empathy to building StartupXYZ's product.",
    },
    {
        userIndex: 2,
        jobIndex: 1,
        coverLetter: "This DevOps Engineer role is exactly what I do every day at Amazon. I manage Kubernetes clusters across 3 AWS regions, have built CI/CD pipelines for 40+ microservices, and our team achieved 99.97% uptime last year. I'm looking for a new challenge where I can build the platform from the ground up rather than maintaining existing infrastructure. The scale of TechCorp India's platform is exciting and I'd love to help build it right from the start.",
    },
    {
        userIndex: 3,
        jobIndex: 3,
        coverLetter: "This ML Engineer role aligns perfectly with what I do at Swiggy. I build recommendation systems using hybrid collaborative + content-based filtering with TensorFlow, currently driving 35% of our order volume. The fintech recommendation problem is fascinating to me — financial decisions have much higher stakes than food ordering, which means model explainability and trust are critical. I have strong ideas about how to approach this and would love to discuss them in an interview.",
    },
    {
        userIndex: 4,
        jobIndex: 4,
        coverLetter: "With 5 years of Android development experience and apps with 1M+ downloads on the Play Store, I'm confident I can make an immediate impact on your consumer app. I've been using Jetpack Compose in production for 8 months now and have seen a 40% improvement in development velocity. I'm also deeply passionate about app performance and accessibility — two things you mentioned caring about. Looking forward to discussing how I can help take your app to the next level.",
    },
    {
        userIndex: 1,
        jobIndex: 4,
        coverLetter: "While my primary background is web development, I have been learning Android development seriously for the past 6 months with Kotlin and Jetpack Compose. My React Native experience gives me a strong foundation in component-driven UI and state management patterns that translate directly. I understand this is a stretch role but I'm a fast learner — I shipped a personal finance side project on the Play Store last month with 500+ downloads. I'd love the chance to grow into a full Android developer at TechCorp.",
    },
    {
        userIndex: 3,
        jobIndex: 2,
        coverLetter: "While ML Engineering is my primary background, I have strong full-stack skills — I built our internal ML experimentation dashboard using React and FastAPI, used by 20+ data scientists. I'm genuinely passionate about the personal finance space and believe ML and product thinking together create much more impactful features than either alone. I'd bring a unique perspective to a full-stack role at a data-driven company like StartupXYZ.",
    },
];

// ─── MAIN SEED FUNCTION ───────────────────────────────────
async function seed() {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║      ConnectSphere Data Seeder v1.0              ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');

    const registeredUsers = [];

    // ── Step 1: Register / Login all users ──────────────────
    console.log('📝  STEP 1: Registering users...');
    console.log('─'.repeat(50));

    for (const u of USERS) {
        try {
            const res = await post('/auth/register', {
                fullName: u.fullName,
                email: u.email,
                password: u.password,
                role: u.role,
            });

            if (res.token) {
                registeredUsers.push({ ...u, token: res.token, userId: res.userId });
                console.log(`  ✅  ${u.fullName.padEnd(20)} (${u.role})`);
            } else {
                // Already registered — try login
                const loginRes = await post('/auth/login', { email: u.email, password: u.password });
                if (loginRes.token) {
                    registeredUsers.push({ ...u, token: loginRes.token, userId: loginRes.userId });
                    console.log(`  🔄  ${u.fullName.padEnd(20)} (already exists — logged in)`);
                } else {
                    console.log(`  ❌  ${u.fullName} — could not register or login`);
                }
            }
        } catch (e) {
            console.log(`  ❌  ${u.fullName}: ${e.message}`);
        }
        await sleep(300);
    }

    console.log(`\n  Total users ready: ${registeredUsers.length}/${USERS.length}\n`);

    // ── Step 2: Create & update profiles ────────────────────
    console.log('👤  STEP 2: Creating profiles...');
    console.log('─'.repeat(50));

    for (const u of registeredUsers) {
        try {
            // Create profile in user-service
            await fetch(
                `${BASE_URL}/users/internal/create?userId=${u.userId}&fullName=${encodeURIComponent(u.fullName)}&email=${u.email}`,
                { method: 'POST' }
            );
            await sleep(200);

            // Update with full profile data
            await put('/users/me', {
                fullName: u.fullName,
                headline: u.headline,
                bio: u.bio,
                location: u.location,
                skills: u.skills,
                experiences: u.experiences,
            }, u.token);

            console.log(`  ✅  ${u.fullName}`);
        } catch (e) {
            console.log(`  ❌  ${u.fullName}: ${e.message}`);
        }
        await sleep(300);
    }

    // ── Step 3: Create posts ─────────────────────────────────
    console.log('\n📝  STEP 3: Creating posts...');
    console.log('─'.repeat(50));

    const createdPosts = [];
    for (const p of POSTS) {
        try {
            const author = registeredUsers[p.authorIndex];
            if (!author) continue;

            const formData = new FormData();
            formData.append('content', p.content);
            formData.append('type', 'TEXT');

            const res = await postForm('/posts', formData, author.token);
            if (res.id) {
                createdPosts.push({ id: res.id, authorIndex: p.authorIndex });
                const preview = p.content.replace(/\n/g, ' ').slice(0, 55);
                console.log(`  ✅  ${author.fullName.padEnd(18)} — "${preview}..."`);
            }
        } catch (e) {
            console.log(`  ❌  Post error: ${e.message}`);
        }
        await sleep(400);
    }

    // ── Step 4: Likes & Comments ─────────────────────────────
    console.log('\n❤️   STEP 4: Adding likes and comments...');
    console.log('─'.repeat(50));

    const sampleComments = [
        "This is incredibly insightful! Thanks for sharing 🙌",
        "Great post! Learned something new today. Saving this for later.",
        "Totally agree with everything here. Should be required reading for every engineer.",
        "This is the kind of content that makes ConnectSphere worth it 🔥",
        "Would love to hear more about this. Are you planning a follow-up post?",
        "Sharing this with my entire team right now. So well articulated.",
        "Couldn't agree more. Learned this the hard way too 😅",
        "This is gold! Bookmarked.",
        "Thank you for taking the time to write this up. Really helpful.",
    ];

    for (const p of createdPosts) {
        const others = registeredUsers.filter((_, i) => i !== p.authorIndex);

        // Each post gets 2-4 random likes
        const numLikes = 2 + Math.floor(Math.random() * 3);
        const likers = others.slice(0, numLikes);
        for (const liker of likers) {
            try { await post(`/posts/${p.id}/like`, null, liker.token); } catch {}
            await sleep(150);
        }

        // Each post gets 1-2 comments from different users
        const numComments = 1 + Math.floor(Math.random() * 2);
        const commenters = [...others].reverse().slice(0, numComments);
        for (const commenter of commenters) {
            try {
                const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
                await post(`/posts/${p.id}/comments`, { content: comment }, commenter.token);
            } catch {}
            await sleep(200);
        }

        console.log(`  ✅  Post ${p.id.slice(0, 8)}... — ${numLikes} likes, ${numComments} comments`);
    }

    // ── Step 5: Connections ──────────────────────────────────
    console.log('\n🤝  STEP 5: Building connections...');
    console.log('─'.repeat(50));

    // Who connects with whom (by user index)
    const connectionPairs = [
        [0, 1], // Rahul ↔ Priya
        [0, 2], // Rahul ↔ Arjun
        [0, 3], // Rahul ↔ Sneha
        [0, 4], // Rahul ↔ Vikram
        [1, 2], // Priya ↔ Arjun
        [1, 3], // Priya ↔ Sneha
        [2, 3], // Arjun ↔ Sneha
        [2, 4], // Arjun ↔ Vikram
        [3, 4], // Sneha ↔ Vikram
        [0, 5], // Rahul ↔ Amit (recruiter)
        [1, 6], // Priya ↔ Neha (recruiter)
    ];

    const acceptedPairs = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Indexes to accept (leave 9,10 pending)

    for (let i = 0; i < connectionPairs.length; i++) {
        const [a, b] = connectionPairs[i];
        try {
            const sender = registeredUsers[a];
            const receiver = registeredUsers[b];
            if (!sender || !receiver) continue;

            const res = await post(
                `/connections/request/${receiver.userId}?receiverName=${encodeURIComponent(receiver.fullName)}`,
                null,
                sender.token
            );

            if (res.id) {
                if (acceptedPairs.includes(i)) {
                    await sleep(200);
                    await put(`/connections/${res.id}/accept`, null, receiver.token);
                    console.log(`  ✅  ${sender.fullName} ↔ ${receiver.fullName} (accepted)`);
                } else {
                    console.log(`  📤  ${sender.fullName} → ${receiver.fullName} (pending)`);
                }
            }
        } catch (e) {
            console.log(`  ❌  Connection error: ${e.message}`);
        }
        await sleep(400);
    }

    // ── Step 6: Messages ─────────────────────────────────────
    console.log('\n💬  STEP 6: Seeding conversations...');
    console.log('─'.repeat(50));

    for (const conv of CONVERSATIONS) {
        const userA = registeredUsers[conv.fromIndex];
        const userB = registeredUsers[conv.toIndex];
        if (!userA || !userB) continue;

        for (const msg of conv.messages) {
            try {
                const sender = msg.sender === conv.fromIndex ? userA : userB;
                const receiver = msg.sender === conv.fromIndex ? userB : userA;
                await post('/messages/send', {
                    receiverId: receiver.userId,
                    receiverName: receiver.fullName,
                    content: msg.text,
                }, sender.token);
            } catch (e) {
                console.log(`  ❌  Message error: ${e.message}`);
            }
            await sleep(250);
        }
        console.log(`  ✅  ${userA.fullName} ↔ ${userB.fullName} (${conv.messages.length} messages)`);
    }

    // ── Step 7: Post Jobs ────────────────────────────────────
    console.log('\n💼  STEP 7: Posting jobs...');
    console.log('─'.repeat(50));

    const createdJobs = [];
    for (const j of JOBS) {
        try {
            const recruiter = registeredUsers[j.recruiterIndex];
            if (!recruiter) continue;

            const res = await post('/jobs', {
                title: j.title,
                description: j.description,
                companyName: j.companyName,
                location: j.location,
                jobType: j.jobType,
                experienceLevel: j.experienceLevel,
                salaryRange: j.salaryRange,
                requiredSkills: j.requiredSkills,
            }, recruiter.token);

            if (res.id) {
                createdJobs.push({ id: res.id, recruiterIndex: j.recruiterIndex, title: j.title });
                console.log(`  ✅  "${j.title}" — ${j.companyName}`);
            }
        } catch (e) {
            console.log(`  ❌  Job error: ${e.message}`);
        }
        await sleep(400);
    }

    // ── Step 8: Job Applications ─────────────────────────────
    console.log('\n📋  STEP 8: Submitting job applications...');
    console.log('─'.repeat(50));

    const createdApplications = [];
    for (const a of APPLICATIONS) {
        try {
            const applicant = registeredUsers[a.userIndex];
            const job = createdJobs[a.jobIndex];
            if (!applicant || !job) continue;

            const res = await post(`/jobs/${job.id}/apply`, {
                coverLetter: a.coverLetter,
                resumeUrl: `https://drive.google.com/${applicant.fullName.toLowerCase().replace(/ /g, '-')}-resume-2025.pdf`,
            }, applicant.token);

            if (res.id) {
                createdApplications.push({
                    id: res.id,
                    applicantName: applicant.fullName,
                    jobTitle: job.title,
                    recruiterIndex: job.recruiterIndex,
                    jobId: job.id,
                });
                console.log(`  ✅  ${applicant.fullName.padEnd(18)} → "${job.title.slice(0, 40)}"`);
            }
        } catch (e) {
            console.log(`  ❌  Application error: ${e.message}`);
        }
        await sleep(350);
    }

    // ── Step 9: Update application statuses ─────────────────
    console.log('\n📊  STEP 9: Updating application statuses...');
    console.log('─'.repeat(50));

    // Group applications by job so recruiters can review them
    for (const job of createdJobs) {
        try {
            const recruiter = registeredUsers[job.recruiterIndex];
            const apps = await get(`/jobs/${job.id}/applicants`, recruiter.token);

            if (Array.isArray(apps) && apps.length > 0) {
                const statuses = ['SHORTLISTED', 'REVIEWING', 'REJECTED'];
                for (let i = 0; i < Math.min(apps.length, 3); i++) {
                    const status = statuses[i] || 'REVIEWING';
                    await put(`/jobs/applications/${apps[i].id}/status?status=${status}`, null, recruiter.token);
                    console.log(`  ✅  ${apps[i].applicantName?.padEnd(18) || 'Applicant'} → ${status} (${job.title.slice(0, 35)})`);
                    await sleep(200);
                }
            }
        } catch (e) {}
        await sleep(300);
    }

    // ── Final Summary ────────────────────────────────────────
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║               🎉 SEEDING COMPLETE!               ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
    console.log('📊  Summary:');
    console.log(`    👥  Users registered    : ${registeredUsers.length}`);
    console.log(`    📝  Posts created       : ${createdPosts.length}`);
    console.log(`    🤝  Connections         : ${connectionPairs.length} (${acceptedPairs.length} accepted)`);
    console.log(`    💬  Conversations       : ${CONVERSATIONS.length}`);
    console.log(`    💼  Jobs posted         : ${createdJobs.length}`);
    console.log(`    📋  Applications        : ${createdApplications.length}`);
    console.log('');
    console.log('🔑  Test Credentials (password: password123):');
    console.log('┌──────────────────────────────────────────────────────┐');
    for (const u of USERS) {
        const role = u.role.padEnd(9);
        const email = u.email.padEnd(30);
        console.log(`│  ${role}  ${email}  │`);
    }
    console.log('└──────────────────────────────────────────────────────┘');
    console.log('');
    console.log('✨  Open http://localhost:5173 and log in with any account!');
    console.log('');
}

seed().catch(err => {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
});