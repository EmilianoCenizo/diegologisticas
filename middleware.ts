import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log('Middleware running for path:', pathname);

  // Permitir todas las solicitudes; la autenticación se verificará en el cliente
  console.log('Allowing request to', pathname, 'to proceed');
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};