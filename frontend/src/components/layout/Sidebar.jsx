import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-60 bg-gray-800 text-white h-full p-4">
      <h2 className="text-lg font-bold mb-4">Menu</h2>

      <ul className="space-y-2">
        <li>
          <Link to="/dashboard" className="block p-2 hover:bg-gray-700">
            Dashboard
          </Link>
        </li>

        <li>
          <Link to="/profile" className="block p-2 hover:bg-gray-700">
            Profile
          </Link>
        </li>

        <li>
          <Link to="/reports" className="block p-2 hover:bg-gray-700">
            Reports
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;