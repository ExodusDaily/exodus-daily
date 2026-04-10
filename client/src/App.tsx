import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import PillarPage from "@/pages/PillarPage";
import ArticlesPage from "@/pages/ArticlesPage";
import ArticleDetail from "@/pages/ArticleDetail";
import Admin from "@/pages/Admin";

function PublicApp() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/admin" component={Admin} />
        <Route>
          <Layout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/pillar/:id" component={PillarPage} />
              <Route path="/articles" component={ArticlesPage} />
              <Route path="/article/:slug" component={ArticleDetail} />
              <Route>
                <div className="flex items-center justify-center h-64 text-gray-500">Page not found.</div>
              </Route>
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PublicApp />
      <Toaster />
    </QueryClientProvider>
  );
}
