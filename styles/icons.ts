// styles/icons.ts
import { ImageSourcePropType } from 'react-native';

export type ThemeType = 'light' | 'dark';

// Định nghĩa type cho một icon item (có dark và light)
export type IconItem = {
    light: ImageSourcePropType; // Sử dụng ImageSourcePropType để chính xác hơn
    dark: ImageSourcePropType;
};

// Định nghĩa type cho một nhóm icon
export type IconGroup = {
    [iconName: string]: IconItem;
};

// Định nghĩa type cho toàn bộ icons
export type Icons = {
    icon_sign_up_in: IconGroup;
    splash: IconItem;
    logo: IconItem;
    tabbar: IconGroup;
    topTab: IconGroup;
    screens: IconGroup;
    profile: IconGroup;
    avatar: IconItem;
};

const icon_sign_up_in: IconGroup = {
    user: {
        dark: require('@/assets/images/Dark/Sign Up/User.png'),
        light: require('@/assets/images/Light/Sign Up/User.png'),
    },
    email: {
        dark: require('@/assets/images/Dark/Sign In/Email.png'),
        light: require('@/assets/images/Light/Sign In/Email.png'),
    },
    google: {
        dark: require('@/assets/images/Dark/Sign In/GoogleIcon.png'),
        light: require('@/assets/images/Light/Sign In/GoogleIcon.png'),
    },
    password: {
        dark: require('@/assets/images/Dark/Sign In/Password.png'),
        light: require('@/assets/images/Light/Sign In/Password.png'),
    },
    hiddenPass: {
        dark: require('@/assets/images/Dark/Sign In/HiddenPass.png'),
        light: require('@/assets/images/Light/Sign In/HiddenPass.png'),
    },
    showPass: {
        dark: require('@/assets/images/Dark/Sign In/ShowPass.png'),
        light: require('@/assets/images/Light/Sign In/ShowPass.png'),
    },
    checked: {
        dark: require('@/assets/images/Dark/Sign Up/Checked.png'),
        light: require('@/assets/images/Light/Sign Up/Checked.png'),
    },
    unChecked: {
        dark: require('@/assets/images/Dark/Sign Up/UnChecked.png'),
        light: require('@/assets/images/Light/Sign Up/UnChecked.png'),
    },
};

const splash: IconItem = {
    dark: require('@/assets/images/Shared/Splash/Splash.png'),
    light: require('@/assets/images/Shared/Splash/Splash.png'),
};

const logo: IconItem = {
    dark: require('@/assets/images/Shared/Logo/LogoSplash.png'),
    light: require('@/assets/images/Shared/Logo/LogoSplash.png'),
};

const tabbar: IconGroup = {
    addProject: {
        dark: require('@/assets/images/Dark/Tabbar/AddProject.png'),
        light: require('@/assets/images/Light/Tabbar/AddProject.png'),
    },
    calendar: {
        dark: require('@/assets/images/Dark/Tabbar/Calendar.png'),
        light: require('@/assets/images/Light/Tabbar/Calendar.png'),
    },
    calendarSelected: {
        dark: require('@/assets/images/Dark/Tabbar/CalendarSelected.png'),
        light: require('@/assets/images/Light/Tabbar/CalendarSelected.png'),
    },
    home: {
        dark: require('@/assets/images/Dark/Tabbar/Home.png'),
        light: require('@/assets/images/Light/Tabbar/Home.png'),
    },
    homeSelected: {
        dark: require('@/assets/images/Dark/Tabbar/HomeSelected.png'),
        light: require('@/assets/images/Light/Tabbar/HomeSelected.png'),
    },
    chat: {
        dark: require('@/assets/images/Dark/Tabbar/Chat.png'),
        light: require('@/assets/images/Light/Tabbar/Chat.png'),
    },
    chatSelected: {
        dark: require('@/assets/images/Dark/Tabbar/ChatSelected.png'),
        light: require('@/assets/images/Light/Tabbar/ChatSelected.png'),
    },
    noti: {
        dark: require('@/assets/images/Dark/Tabbar/Notification.png'),
        light: require('@/assets/images/Light/Tabbar/Notification.png'),
    },
    notiSelected: {
        dark: require('@/assets/images/Dark/Tabbar/NotificationSelected.png'),
        light: require('@/assets/images/Light/Tabbar/NotificationSelected.png'),
    },
};

const topTab: IconGroup = {
    addProject: {
        dark: require('@/assets/images/Dark/TopTab/Add.png'),
        light: require('@/assets/images/Light/TopTab/Add.png'),
    },
    back: {
        dark: require('@/assets/images/Dark/TopTab/Back.png'),
        light: require('@/assets/images/Light/TopTab/Back.png'),
    },
    edit: {
        dark: require('@/assets/images/Dark/TopTab/Edit.png'),
        light: require('@/assets/images/Light/TopTab/Edit.png'),
    },
    phone: {
        dark: require('@/assets/images/Dark/TopTab/Phone.png'),
        light: require('@/assets/images/Light/TopTab/Phone.png'),
    },
    search: {
        dark: require('@/assets/images/Dark/TopTab/Search.png'),
        light: require('@/assets/images/Light/TopTab/Search.png'),
    },
    video: {
        dark: require('@/assets/images/Dark/TopTab/Video.png'),
        light: require('@/assets/images/Light/TopTab/Video.png'),
    },
};

const screens: IconGroup = {
    search: {
        dark: require('@/assets/images/Dark/Home Screen/Search.png'),
        light: require('@/assets/images/Light/Home Screen/Search.png'),
    },
    setting: {
        dark: require('@/assets/images/Dark/Home Screen/Setting.png'),
        light: require('@/assets/images/Light/Home Screen/Setting.png'),
    },
    dueDate: {
        dark: require('@/assets/images/Dark/Project Details/DueDate.png'),
        light: require('@/assets/images/Light/Project Details/DueDate.png'),
    },
    teamMember: {
        dark: require('@/assets/images/Dark/Project Details/TeamMember.png'),
        light: require('@/assets/images/Light/Project Details/TeamMember.png'),
    },
    tickedCircle: {
        dark: require('@/assets/images/Dark/Project Details/TickedCircle.png'),
        light: require('@/assets/images/Light/Project Details/TickedCircle.png'),
    },
    unTickedCircle: {
        dark: require('@/assets/images/Dark/Project Details/UntickedCircle.png'),
        light: require('@/assets/images/Light/Project Details/UntickedCircle.png'),
    },
    send: {
        dark: require('@/assets/images/Dark/Chat/Send.png'),
        light: require('@/assets/images/Light/Chat/Send.png'),
    },
    utilities: {
        dark: require('@/assets/images/Dark/Chat/Utilities.png'),
        light: require('@/assets/images/Light/Chat/Utilities.png'),
    },
    voice: {
        dark: require('@/assets/images/Dark/Chat/Voice.png'),
        light: require('@/assets/images/Light/Chat/Voice.png'),
    },
    add: {
        dark: require('@/assets/images/Dark/Create New Project/AddMember.png'),
        light: require('@/assets/images/Light/Create New Project/AddMember.png'),
    },
    delete: {
        dark: require('@/assets/images/Dark/Create New Project/DeleteMember.png'),
        light: require('@/assets/images/Light/Create New Project/DeleteMember.png'),
    },
    clock: {
        dark: require('@/assets/images/Dark/Create New Project/Clock.png'),
        light: require('@/assets/images/Light/Create New Project/Clock.png'),
    },
    calendar: {
        dark: require('@/assets/images/Dark/Create New Project/Calendar.png'),
        light: require('@/assets/images/Light/Create New Project/Calendar.png'),
    },
    more: {
        dark: require('@/assets/images/Dark/Create New Project/More.png'),
        light: require('@/assets/images/Light/Create New Project/More.png'),
    },
};

const profile: IconGroup = {
    avatarEditing: {
        dark: require('@/assets/images/Dark/Profile/AvatarEditing.png'),
        light: require('@/assets/images/Light/Profile/AvatarEditing.png'),
    },
    edit: {
        dark: require('@/assets/images/Dark/Profile/Edit.png'),
        light: require('@/assets/images/Light/Profile/Edit.png'),
    },
    email: {
        dark: require('@/assets/images/Dark/Profile/Email.png'),
        light: require('@/assets/images/Light/Profile/Email.png'),
    },
    logout: {
        dark: require('@/assets/images/Dark/Profile/Logout.png'),
        light: require('@/assets/images/Light/Profile/Logout.png'),
    },
    more: {
        dark: require('@/assets/images/Dark/Profile/More.png'),
        light: require('@/assets/images/Light/Profile/More.png'),
    },
    shorten: {
        dark: require('@/assets/images/Dark/Profile/Shorten.png'),
        light: require('@/assets/images/Light/Profile/Shorten.png'),
    },
    myTask: {
        dark: require('@/assets/images/Dark/Profile/MyTask.png'),
        light: require('@/assets/images/Light/Profile/MyTask.png'),
    },
    password: {
        dark: require('@/assets/images/Dark/Profile/Password.png'),
        light: require('@/assets/images/Light/Profile/Password.png'),
    },
    privacy: {
        dark: require('@/assets/images/Dark/Profile/Provacy.png'),
        light: require('@/assets/images/Light/Profile/Provacy.png'),
    },
    setting: {
        dark: require('@/assets/images/Dark/Profile/Setting.png'),
        light: require('@/assets/images/Light/Profile/Setting.png'),
    },
    userName: {
        dark: require('@/assets/images/Dark/Profile/UserName.png'),
        light: require('@/assets/images/Light/Profile/UserName.png'),
    },
};

const avatar: IconItem = {
    dark: require('@/assets/images/Shared/Avatar/Ellipse 36.png'),
    light: require('@/assets/images/Shared/Avatar/Ellipse 36.png'),
};

const icons: Icons = {
    icon_sign_up_in,
    splash,
    logo,
    tabbar,
    topTab,
    screens,
    profile,
    avatar,
};

export default icons;