import React from 'react';
import {
  Bitcoin,
  DollarSign,
  Cloud,
  Globe,
  TrendingUp,
  ArrowLeftRight,
  Plane,
  Package,
  Building,
  Store,
  Truck,
  CreditCard,
  Activity,
  Smartphone,
  Mail,
  MessageSquare,
  Bell,
  Cpu,
  Server,
  Home,
  Car,
  ShoppingCart,
  Zap,
  Droplet,
  Thermometer,
  Wind,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Navigation,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Settings,
  User,
  Users,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MoreHorizontal,
  Plus,
  Minus,
  X,
  Check,
  Copy,
  Clipboard,
  Download,
  Upload,
  Share,
  ExternalLink,
  Link,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Gauge,
  BarChart,
  LineChart,
  PieChart,
  Database,
  HardDrive,
  Monitor,
  Tablet,
  Watch,
  Headphones,
  Speaker,
  Mic,
  Camera,
  Video,
  Image,
  FileText,
  File,
  Folder,
  FolderOpen,
  Archive,
  Trash,
  Edit,
  Save,
  RefreshCw,
  RotateCw,
  Repeat,
  Play,
  Pause,
  Square,
  Circle
} from 'lucide-react';

interface IconProps {
  className?: string;
  size?: number;
}

// Service-specific icons
export const CryptoIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Bitcoin className={className} size={size} />
);

export const WeatherIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Cloud className={className} size={size} />
);

export const WebsiteIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Globe className={className} size={size} />
);

export const StockIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <TrendingUp className={className} size={size} />
);

export const CurrencyIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <ArrowLeftRight className={className} size={size} />
);

export const FlightIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Plane className={className} size={size} />
);

export const DeliveryIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Package className={className} size={size} />
);

export const BankIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Building className={className} size={size} />
);

export const StoreIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Store className={className} size={size} />
);

export const ShippingIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Truck className={className} size={size} />
);

// Notification channel icons
export const EmailIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Mail className={className} size={size} />
);

export const SmsIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <MessageSquare className={className} size={size} />
);

export const PushIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Bell className={className} size={size} />
);

export const PhoneIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Smartphone className={className} size={size} />
);

// Custom Bitcoin icon with more detail
export const BitcoinDetailedIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path
      d="M9 8V16M15 8V16M7 10H9M7 14H9M15 10H17M15 14H17M9 8H13C14.1046 8 15 8.89543 15 10C15 11.1046 14.1046 12 13 12H9M9 12H13.5C14.6046 12 15.5 12.8954 15.5 14C15.5 15.1046 14.6046 16 13.5 16H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Custom Ethereum icon
export const EthereumIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2L4 12L12 16L20 12L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 16L4 12L12 22L20 12L12 16Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Custom Telegram icon
export const TelegramIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M21 3L3 11L10 14L13 21L16 15L21 3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 14L21 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Custom WhatsApp icon
export const WhatsAppIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M21 11.5C21 16.75 16.75 21 11.5 21C9.8 21 8.2 20.5 6.8 19.6L3 21L4.4 17.2C3.5 15.8 3 14.2 3 12.5C3 7.25 7.25 3 12.5 3C17.75 3 22 7.25 22 12.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 10C8 9.5 8.5 9 9 9C9.5 9 10 9.5 10 10C10 11 11 12 12 12C13 12 14 11 14 10C14 9.5 14.5 9 15 9C15.5 9 16 9.5 16 10C16 12 14 14 12 14C10 14 8 12 8 10Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Custom Slack icon
export const SlackIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="13" y="2" width="3" height="8" rx="1.5" stroke="currentColor" strokeWidth="2"/>
    <rect x="8" y="14" width="3" height="8" rx="1.5" stroke="currentColor" strokeWidth="2"/>
    <rect x="2" y="8" width="8" height="3" rx="1.5" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="13" width="8" height="3" rx="1.5" stroke="currentColor" strokeWidth="2"/>
    <rect x="8" y="2" width="3" height="3" rx="1.5" stroke="currentColor" strokeWidth="2"/>
    <rect x="13" y="19" width="3" height="3" rx="1.5" stroke="currentColor" strokeWidth="2"/>
    <rect x="2" y="13" width="3" height="3" rx="1.5" stroke="currentColor" strokeWidth="2"/>
    <rect x="19" y="8" width="3" height="3" rx="1.5" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// Service type mapping
export const getServiceIcon = (service: string): React.FC<IconProps> => {
  const iconMap: { [key: string]: React.FC<IconProps> } = {
    crypto: CryptoIcon,
    bitcoin: BitcoinDetailedIcon,
    ethereum: EthereumIcon,
    weather: WeatherIcon,
    website: WebsiteIcon,
    stock: StockIcon,
    currency: CurrencyIcon,
    flight: FlightIcon,
    delivery: DeliveryIcon,
    package: DeliveryIcon,
    bank: BankIcon,
    store: StoreIcon,
    restaurant: StoreIcon,
    shipping: ShippingIcon,
    email: EmailIcon,
    sms: SmsIcon,
    push: PushIcon,
    telegram: TelegramIcon,
    whatsapp: WhatsAppIcon,
    slack: SlackIcon,
    phone: PhoneIcon,
  };

  return iconMap[service.toLowerCase()] || Globe;
};

// Export all Lucide icons for general use
export {
  Bitcoin,
  DollarSign,
  Cloud,
  Globe,
  TrendingUp,
  ArrowLeftRight,
  Plane,
  Package,
  Building,
  Store,
  Truck,
  CreditCard,
  Activity,
  Smartphone,
  Mail,
  MessageSquare,
  Bell,
  Cpu,
  Server,
  Home,
  Car,
  ShoppingCart,
  Zap,
  Droplet,
  Thermometer,
  Wind,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Navigation,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Settings,
  User,
  Users,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MoreHorizontal,
  Plus,
  Minus,
  X,
  Check,
  Copy,
  Clipboard,
  Download,
  Upload,
  Share,
  ExternalLink,
  Link,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Signal,
  Gauge,
  BarChart,
  LineChart,
  PieChart,
  Database,
  HardDrive,
  Monitor,
  Tablet,
  Watch,
  RefreshCw,
  Play,
  Pause
};