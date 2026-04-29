import { type ReactNode } from 'react'
import { cn } from '../../utils/cn';


interface ContainerProps {
    children: ReactNode;
    className?: string;
    fluid?: boolean;
}

const Container = ({ children, className, fluid = false }: ContainerProps) => {
  return (
    <div
        className={cn(
            'mx-auto px-4 sm:px-6 lg:px-8 w-full',
            fluid ? 'max-w-full' : 'max-w-7xl',
            className
        )}
    >
        {children}
    </div>
  )
}

export default Container