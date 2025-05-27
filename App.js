import React, { useState, useEffect } from 'react';
import FirewatchApp from './components/FirewatchApp.js';
import SignUpPage from './components/SignUpPage.js'; 
import SignInPage from './components/SignInPage.js'; 
import UserManagementPage from './components/UserManagementPage.js';
import WildfireFormPage from './components/WildfireFormPage.js'; 
import ReportUpdatePage from './components/ReportUpdatePage.js'; 
import ReviewUpdatesPage from './components/ReviewUpdatesPage.js'; 
import ReviewPendingIncidentsPage from './components/ReviewPendingIncidentsPage.js';
import AdminAllIncidentsPage from './components/AdminAllIncidentsPage.js'; 
import useAuth from './hooks/useAuth.js';
import LoadingSpinnerIcon from './components/icons/LoadingSpinnerIcon.js';

// Redirect component to handle navigation side-effects correctly
const Redirect = ({ to, currentRouteForRedirectParam }) => {
  useEffect(() => {
    let targetUrl = to;
    if (to === '#/signin' && currentRouteForRedirectParam) {
      const existingRedirectParam = new URLSearchParams(targetUrl.split('?')[1] || '').get('redirect');
      if (!existingRedirectParam) { 
         const redirectPathValue = currentRouteForRedirectParam.startsWith('#/') 
                                    ? currentRouteForRedirectParam.substring(2) 
                                    : (currentRouteForRedirectParam.startsWith('/') 
                                        ? currentRouteForRedirectParam.substring(1) 
                                        : currentRouteForRedirectParam);
         targetUrl = `${targetUrl.split('?')[0]}?redirect=${encodeURIComponent(redirectPathValue)}`;
      }
    }
    
    if (window.location.hash !== targetUrl) {
      window.location.hash = targetUrl;
    }
  }, [to, currentRouteForRedirectParam]);

  return (
    React.createElement('div', { className: "h-screen bg-gray-900 flex flex-col items-center justify-center text-white" },
      React.createElement(LoadingSpinnerIcon, { className: "w-10 h-10 text-indigo-400" }),
      React.createElement('p', { className: "mt-2" }, "Redirecting...")
    )
  );
};


const App = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const auth = useAuth();

  useEffect(() => {
    if (auth.user) { 
      const currentHash = window.location.hash || '#/';
      const routeWithoutHashEffect = currentHash.startsWith('#') ? currentHash.substring(1) : currentHash;
      const pathAndQueryEffect = routeWithoutHashEffect.split('?');
      const pathSegmentsEffect = pathAndQueryEffect[0].split('/').filter(segment => segment !== ''); 
      const basePathEffect = pathSegmentsEffect[0] || ''; 

      if (basePathEffect === 'signin' || basePathEffect === 'signup') { 
        let targetPath = '#/'; 

        if (basePathEffect === 'signin') {
          const queryParamsEffect = new URLSearchParams(pathAndQueryEffect[1] || '');
          const redirectUri = queryParamsEffect.get('redirect');

          if (redirectUri) {
            let tempRedirectPath = redirectUri;
            try {
              const urlCheck = new URL(tempRedirectPath);
              if (urlCheck.protocol && urlCheck.host) { 
                console.warn(`Invalid redirectUri (absolute URL detected): "${redirectUri}". Defaulting to home.`);
                tempRedirectPath = '/'; 
              }
            } catch (e) {
              // Not an absolute URL, good.
            }
            
            tempRedirectPath = tempRedirectPath.replace(/^#?\/?/, ''); 
            targetPath = `#/${tempRedirectPath}`; 
          }
        }
        
        if (window.location.hash !== targetPath) {
          window.location.hash = targetPath; 
        }
      }
    }
  }, [auth.user]); 

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);

    const initialHash = window.location.hash || '#/';
    setRoute(initialHash); 
    if (!window.location.hash) { 
       window.location.hash = '#/'; 
    }
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []); 


  if (auth.loading) {
    return (
      React.createElement('div', { className: "h-screen bg-gray-900 flex flex-col items-center justify-center text-white" },
        React.createElement(LoadingSpinnerIcon, { className: "w-12 h-12 mb-4 text-indigo-400" }),
        React.createElement('p', { className: "text-xl" }, "Initializing Firewatch...")
      )
    );
  }

  const renderAccessDenied = (message) => (
    React.createElement('div', { className: "h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4" },
      React.createElement('h1', { className: "text-3xl font-bold text-red-500 mb-4" }, "Access Denied"),
      React.createElement('p', { className: "text-lg text-gray-300 mb-6" }, message || "You do not have permission to view this page."),
      React.createElement('a', { href: "#/", className: "px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors" }, "Go to Dashboard")
    )
  );

  const renderNotFound = (message) => (
     React.createElement('div', { className: "h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4" },
        React.createElement('h1', { className: "text-3xl font-bold text-yellow-400 mb-4" }, "Not Found"),
        React.createElement('p', { className: "text-lg text-gray-300 mb-6" }, message || "The page or resource you're looking for could not be found."),
        React.createElement('a', { href: "#/", className: "px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors" }, "Go to Dashboard")
    )
  );

  const renderContent = () => {
    console.log(`[App.js] renderContent called. Current route: "${route}", Auth loading: ${auth.loading}, User: ${auth.user ? auth.user.email : 'null'}`);
    const routeWithoutHash = route.startsWith('#') ? route.substring(1) : route;
    const pathAndQuery = routeWithoutHash.split('?');
    const pathSegments = pathAndQuery[0].split('/').filter(segment => segment !== ''); 
    const queryParams = new URLSearchParams(pathAndQuery[1] || '');

    const basePath = pathSegments[0] || ''; 

    const staffOrAdminRoute = (ComponentGenerator) => {
      if (!auth.user) return React.createElement(Redirect, { to: "#/signin", currentRouteForRedirectParam: route });
      if (auth.user.role === 'admin' || auth.user.role === 'staff') return ComponentGenerator();
      return renderAccessDenied();
    };
    
    const adminOnlyRoute = (ComponentGenerator) => {
      if (!auth.user) return React.createElement(Redirect, { to: "#/signin", currentRouteForRedirectParam: route });
      if (auth.user.role === 'admin') return ComponentGenerator();
      return renderAccessDenied();
    };

    const authenticatedRoute = (ComponentGenerator) => {
      if (!auth.user) return React.createElement(Redirect, { to: "#/signin", currentRouteForRedirectParam: route });
      return ComponentGenerator();
    };
    
    if (basePath === '' && pathSegments.length === 0) { 
        return React.createElement(FirewatchApp, { authForNav: auth });
    }

    if (basePath === 'signup') {
      return React.createElement(SignUpPage, { auth: auth });
    }
    if (basePath === 'signin') {
      const redirect = queryParams.get('redirect'); 
      return React.createElement(SignInPage, { auth: auth, redirectParam: redirect });
    }

    if (basePath === 'admin') {
      const adminSubPath = pathSegments[1] || '';
      if (adminSubPath === 'user-management') {
        return staffOrAdminRoute(() => React.createElement(UserManagementPage, { currentUser: auth.user }));
      }
      if (adminSubPath === 'all-incidents') { 
        return adminOnlyRoute(() => React.createElement(AdminAllIncidentsPage, { currentUser: auth.user }));
      }
      if (adminSubPath === 'dashboard') {
        return adminOnlyRoute(() => (
          React.createElement('div', { className: "h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4" },
              React.createElement('h1', { className: "text-3xl font-bold text-indigo-400 mb-4" }, "Admin Dashboard"),
              React.createElement('p', { className: "text-lg text-gray-300 mb-6" }, `Welcome, Admin ${auth.user.name || auth.user.email}!`),
              React.createElement('p', { className: "text-gray-400" }, "This is a placeholder for the main admin dashboard."),
              React.createElement('div', { className: "mt-6 space-x-4" },
                  React.createElement('a', { href: "#/", className: "px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors" }, "Go to Main Dashboard"),
                  React.createElement('a', { href: "#/admin/user-management", className: "px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors" }, "Manage Users"),
                   React.createElement('a', { href: "#/admin/all-incidents", className: "px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors" }, "All Incidents Archive")
              )
          )
        ));
      }
      return renderNotFound(`Admin page /admin/${adminSubPath} not found.`);
    }

    if (basePath === 'staff') {
      const staffSubPath = pathSegments[1] || '';
      const actionPath = pathSegments[2] || ''; 

      if (staffSubPath === 'incident' && actionPath === 'add') {
        return React.createElement(WildfireFormPage, { currentUser: auth.user }); 
      }
      if (staffSubPath === 'incident' && actionPath === 'edit') {
        const incidentId = queryParams.get('id');
        if (!incidentId) return renderNotFound("Missing Incident ID for editing.");
        return staffOrAdminRoute(() => React.createElement(WildfireFormPage, { currentUser: auth.user, incidentId: incidentId }));
      }
      if (staffSubPath === 'updates' && pathSegments.length === 2) { 
        return staffOrAdminRoute(() => React.createElement(ReviewUpdatesPage, { currentUser: auth.user }));
      }
      if (staffSubPath === 'review-incidents' && pathSegments.length === 2) { 
        return staffOrAdminRoute(() => React.createElement(ReviewPendingIncidentsPage, { currentUser: auth.user }));
      }
      return renderNotFound(`Staff page /staff/${staffSubPath}${actionPath ? '/'+actionPath : ''} not found.`);
    }
    
    if (basePath === 'wildfire') {
        const wildfireId = pathSegments[1];
        const actionPath = pathSegments[2];
        if (wildfireId && actionPath === 'add-update' && pathSegments.length === 3) { 
            return authenticatedRoute(() => React.createElement(ReportUpdatePage, { wildfireId: wildfireId, currentUser: auth.user }));
        }
        return renderNotFound(`Wildfire action /wildfire/${wildfireId || '[id]'}/${actionPath || '[action]'} not found.`);
    }

    if (route.startsWith("#/staff/update-wildfire")) { 
        const oldId = queryParams.get('id');
        if (oldId) return React.createElement(Redirect, { to: `#/staff/incident/edit?id=${oldId}` });
        return renderNotFound("Legacy route staff/update-wildfire is missing ID.");
    }
    if (route.startsWith("#/incident/report-update")) { 
        const oldId = queryParams.get('id');
        if (oldId) return React.createElement(Redirect, { to: `#/wildfire/${oldId}/add-update` });
        return renderNotFound("Legacy route incident/report-update is missing ID.");
    }
    
    console.warn("Unhandled route in renderContent, showing Not Found:", route);
    return renderNotFound(`The page for "${route}" could not be found.`);
  };

  return renderContent();
};

export default App;