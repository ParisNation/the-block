import { Link } from "react-router-dom";

function Header() {
    return (
        <header className="w-full bg-openlane-navy text-white px-6 py-4 flex items-center justify-between">
            {/*
                Logo doubles as the home button. Link instead of a plain anchor so
                the router handles it client side and doesn't reload the whole app.
                Absolute path off the web root, so it still resolves on /vehicles/:id.
            */}
            <Link to="/" className="flex items-center">
                <img
                    src="../src/assets/openlane-logo.svg"
                    alt="OPENLANE — back to inventory"
                    className="h-6 z w-auto"
                />
            </Link>

            {/* Signed in user */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-openlane-blue flex items-center justify-center text-sm font-semibold">
                    P
                </div>
            </div>
        </header>
    );
}

export default Header;