import React, { Component, ReactNode } from 'react';
import CustomText from '../constants/CustomText';
import { View } from 'react-native';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Cập nhật trạng thái để hiển thị UI lỗi
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Có thể ghi lại lỗi ở đây, ví dụ: gửi lỗi lên server
        console.error("Caught an error:", error);
        console.error("Error info:", errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Giao diện lỗi nếu có lỗi xảy ra
            return <View><CustomText fontFamily='Inter' fontSize={16}>Có lỗi xảy ra. Vui lòng thử lại sau!</CustomText></View>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
