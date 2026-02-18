import {Link,useLocation} from 'react-router-dom';
import {FiX,FiHome,FiGrid,FiShoppingCart,FiUser,FiSettings,FiLogOut,FiHelpCircle,FiInfo,FiChevronRight} from 'react-icons/fi';

const Sidebar = () => {
    const {logout} = useAuth();
    const {isOpen,toggleSidebar} = useSidebar();
    const location = useLocation();

    const navLinks = [
        {name:'Home',path:'/',icon:FiHome},
        {name:'Products',path:'/products',icon:FiGrid},
        {name:'Cart',path:'/cart',icon:FiShoppingCart},
        {name:'Profile',path:'/profile',icon:FiUser},
        {name:'Settings',path:'/settings',icon:FiSettings},
        {name:'Help',path:'/help',icon:FiHelpCircle},
        {name:'About',path:'/about',icon:FiInfo},
    ];

    return (
        <>
        {/* Overlay */}
        {isOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar}></div>
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <Link to="/" className="flex items-center space-x-2 group" onClick={toggleSidebar}>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/30 transition-all">
                        <span className="text-white font-bold text-xl">TG</span>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-white">Tech</span>
                        <span className="text-xl font-bold text-primary-400">Gear</span>
                    </div>
                </Link>
                <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white transition-colors">
                    <FiX className="w-6 h-6" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        to={link.path}
                        onClick={toggleSidebar}
                        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === link.path ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <link.icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{link.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                <button
                    onClick={() => {
                        logout();
                        toggleSidebar();
                    }}
                    className="w-full flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-all duration-200"
                >
                    <FiLogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
        </>
    );
};

export default Sidebar; 