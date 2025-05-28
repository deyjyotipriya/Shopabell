import { BiVideo, BiPackage, BiChart } from 'react-icons/bi';
import { HiSpeakerphone } from 'react-icons/hi';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
}

const actions: QuickAction[] = [
  {
    title: 'Start Livestream',
    description: 'Go live and showcase your products',
    icon: <BiVideo className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    href: '/livestream/new',
  },
  {
    title: 'Add Product',
    description: 'List a new product in your store',
    icon: <BiPackage className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    href: '/products/new',
  },
  {
    title: 'Create Campaign',
    description: 'Launch a marketing campaign',
    icon: <HiSpeakerphone className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
    href: '/campaigns/new',
  },
  {
    title: 'View Analytics',
    description: 'Detailed performance insights',
    icon: <BiChart className="w-6 h-6" />,
    color: 'from-orange-500 to-orange-600',
    href: '/analytics',
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <a
            key={action.title}
            href={action.href}
            className="group flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-all hover:shadow-md"
          >
            <div className={`bg-gradient-to-br ${action.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}