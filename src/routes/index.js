import React, { lazy, Suspense } from 'react';
import { Redirect } from 'react-router-dom';

const HomeComponent = lazy(() => import('../application/Home'));
const RecommendComponent = lazy(() => import('../application/Recommend'));
const SingersComponent = lazy(() => import('../application/Singers'));
const RankComponent = lazy(() => import('../application/Rank'));
const AlbumComponent = lazy(() => import('../application/Album'));
const SingerComponent = lazy(() => import('../application/Singer'));
const SearchComponent = lazy(() => import('../application/Search'));

const SuspenseComponent = Component => props => (
  <Suspense fallback={null}>
    <Component {...props} />
  </Suspense>
)

export default [
  {
    path: '/',
    component: SuspenseComponent(HomeComponent),
    routes: [
      {
        path: '/',
        exact: true,
        render: () => (
          <Redirect to={"/recommend"} />
        )
      },
      {
        path: '/recommend',
        component: SuspenseComponent(RecommendComponent),
        routes: [
          {
            path: '/recommend/:id',
            component: SuspenseComponent(AlbumComponent),
          }
        ]
      },
      {
        path: '/singers',
        component: SuspenseComponent(SingersComponent),
        routes: [
          {
            path: '/singers/:id',
            component: SuspenseComponent(SingerComponent)
          }
        ]
      },
      {
        path: '/rank',
        component: SuspenseComponent(RankComponent),
        routes: [
          {
            path: '/rank/:id',
            component: SuspenseComponent(AlbumComponent),
          }
        ]
      },
      {
        path: "/album/:id",
        exact: true,
        key: "album",
        component: SuspenseComponent(AlbumComponent)
      },
      {
        path: '/search',
        exact: true,
        key: 'search',
        component: SuspenseComponent(SearchComponent)
      },
    ]
  }
]