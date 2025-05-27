
import React, { useState, useEffect } from 'react';
import FirewatchApp from './components/FirewatchApp';
import SignUpPage from './components/SignUpPage'; 
import SignInPage from './components/SignInPage'; 
import UserManagementPage from './components/UserManagementPage';
import WildfireFormPage from './components/WildfireFormPage'; 
import ReportUpdatePage from './components/ReportUpdatePage'; 
import ReviewUpdatesPage from './components/ReviewUpdatesPage'; 
import ReviewPendingIncidentsPage from './components/ReviewPendingIncidentsPage'; // New page for incident creation reviews
import AdminAllIncidentsPage from './components/AdminAllIncidentsPage'; 
import useAuth from './hooks/useAuth';
import LoadingSpinnerIcon from './components/icons/LoadingSpinnerIcon';

// Redirect component to handle navigation side-effects correctly
const Redirect: React.FC<{ to: string; currentRouteForRedirectParam?: string }> = ({ to, currentRouteForRedirectParam }) => {
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
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <LoadingSpinnerIcon className="w-10 h-10 text-indigo-400" />
      <p className="mt-2">Redirecting...</p>
    </div>
  );
};


const App: React.FC = () => {
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
      <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <LoadingSpinnerIcon className="w-12 h-12 mb-4 text-indigo-400" />
        <p className="text-xl">Initializing Firewatch...</p>
      </div>
    );
  }

  const renderAccessDenied = (message?: string) => (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-300 mb-6">{message || "You do not have permission to view this page."}</p>
      <a href="#/" className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors">
        Go to Dashboard
      </a>
    </div>
  );

  const renderNotFound = (message?: string) => (
     <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">Not Found</h1>
        <p className="text-lg text-gray-300 mb-6">{message || "The page or resource you're looking for could not be found."}</p>
        <a href="#/" className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors">
            Go to Dashboard
        </a>
    </div>
  );

  const renderContent = () => {
    const routeWithoutHash = route.startsWith('#') ? route.substring(1) : route;
    const pathAndQuery = routeWithoutHash.split('?');
    const pathSegments = pathAndQuery[0].split('/').filter(segment => segment !== ''); 
    const queryParams = new URLSearchParams(pathAndQuery[1] || '');

    const basePath = pathSegments[0] || ''; 

    const staffOrAdminRoute = (ComponentGenerator: () => React.ReactNode) => {
      if (!auth.user) return <Redirect to="#/signin" currentRouteForRedirectParam={route} />;
      if (auth.user.role === 'admin' || auth.user.role === 'staff') return ComponentGenerator();
      return renderAccessDenied();
    };
    
    const adminOnlyRoute = (ComponentGenerator: () => React.ReactNode) => {
      if (!auth.user) return <Redirect to="#/signin" currentRouteForRedirectParam={route} />;
      if (auth.user.role === 'admin') return ComponentGenerator();
      return renderAccessDenied();
    };

    const authenticatedRoute = (ComponentGenerator: () => React.ReactNode) => {
      if (!auth.user) return <Redirect to="#/signin" currentRouteForRedirectParam={route} />;
      return ComponentGenerator();
    };
    
    if (basePath === '' && pathSegments.length === 0) { 
        return <FirewatchApp authForNav={auth} />;
    }

    if (basePath === 'signup') {
      return <SignUpPage auth={auth} />;
    }
    if (basePath === 'signin') {
      const redirect = queryParams.get('redirect'); 
      return <SignInPage auth={auth} redirectParam={redirect} />;
    }

    if (basePath === 'admin') {
      const adminSubPath = pathSegments[1] || '';
      if (adminSubPath === 'user-management') {
        return staffOrAdminRoute(() => <UserManagementPage currentUser={auth.user!} />);
      }
      if (adminSubPath === 'all-incidents') { 
        return adminOnlyRoute(() => <AdminAllIncidentsPage currentUser={auth.user!} />);
      }
      if (adminSubPath === 'dashboard') {
        return adminOnlyRoute(() => (
          <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
              <h1 className="text-3xl font-bold text-indigo-400 mb-4">Admin Dashboard</h1>
              <p className="text-lg text-gray-300 mb-6">Welcome, Admin {auth.user!.name || auth.user!.email}!</p>
              <p className="text-gray-400">This is a placeholder for the main admin dashboard.</p>
              <div className="mt-6 space-x-4">
                  <a href="#/" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors">
                      Go to Main Dashboard
                  </a>
                  <a href="#/admin/user-management" className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors">
                      Manage Users
                  </a>
                   <a href="#/admin/all-incidents" className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors">
                      All Incidents Archive
                  </a>
              </div>
          </div>
        ));
      }
      return renderNotFound(`Admin page /admin/${adminSubPath} not found.`);
    }

    if (basePath === 'staff') {
      const staffSubPath = pathSegments[1] || '';
      const actionPath = pathSegments[2] || ''; 

      if (staffSubPath === 'incident' && actionPath === 'add') {
        return <WildfireFormPage currentUser={auth.user} />; 
      }
      if (staffSubPath === 'incident' && actionPath === 'edit') {
        const incidentId = queryParams.get('id');
        if (!incidentId) return renderNotFound("Missing Incident ID for editing.");
        return staffOrAdminRoute(() => <WildfireFormPage currentUser={auth.user!} incidentId={incidentId} />);
      }
      if (staffSubPath === 'updates' && pathSegments.length === 2) { 
        return staffOrAdminRoute(() => <ReviewUpdatesPage currentUser={auth.user!} />);
      }
      if (staffSubPath === 'review-incidents' && pathSegments.length === 2) { // New route for reviewing pending incidents
        return staffOrAdminRoute(() => <ReviewPendingIncidentsPage currentUser={auth.user!} />);
      }
      return renderNotFound(`Staff page /staff/${staffSubPath}${actionPath ? '/'+actionPath : ''} not found.`);
    }
    
    if (basePath === 'wildfire') {
        const wildfireId = pathSegments[1];
        const actionPath = pathSegments[2];
        if (wildfireId && actionPath === 'add-update' && pathSegments.length === 3) { 
            return authenticatedRoute(() => <ReportUpdatePage wildfireId={wildfireId} currentUser={auth.user!} />);
        }
        return renderNotFound(`Wildfire action /wildfire/${wildfireId || '[id]'}/${actionPath || '[action]'} not found.`);
    }

    if (route.startsWith("#/staff/update-wildfire")) { 
        const oldId = queryParams.get('id');
        if (oldId) return <Redirect to={`#/staff/incident/edit?id=${oldId}`} />;
        return renderNotFound("Legacy route staff/update-wildfire is missing ID.");
    }
    if (route.startsWith("#/incident/report-update")) { 
        const oldId = queryParams.get('id');
        if (oldId) return <Redirect to={`#/wildfire/${oldId}/add-update`} />;
        return renderNotFound("Legacy route incident/report-update is missing ID.");
    }
    
    console.warn("Unhandled route in renderContent, showing Not Found:", route);
    return renderNotFound(`The page for "${route}" could not be found.`);
  };

  return renderContent();
};

export default App;
