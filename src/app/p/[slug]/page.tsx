import { notFound } from "next/navigation";
import { api } from "~/trpc/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicLandingPage({ params }: PageProps) {
  const { slug } = await params;

  // Get the published project
  let project;
  try {
    project = await api.project.getBySlug({ slug });
  } catch (error) {
    notFound();
  }

  if (!project.htmlContent) {
    notFound();
  }

  // Inject waitlist form functionality into the HTML
  const modifiedHtml = injectWaitlistForm(project.htmlContent, project.id);

  return (
    <div className="min-h-screen">
      <div dangerouslySetInnerHTML={{ __html: modifiedHtml }} />
    </div>
  );
}

// Function to inject waitlist form functionality into the HTML
function injectWaitlistForm(htmlContent: string, projectId: string): string {
  const formScript = `
    <script>
      // Find all waitlist forms
      const waitlistForms = document.querySelectorAll('form[data-waitlist], form:has(input[type="email"])');
      
      waitlistForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const emailInput = form.querySelector('input[type="email"]');
          if (!emailInput) return;
          
          const email = emailInput.value.trim();
          if (!email) return;
          
          // Show loading state
          const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
          const originalText = submitBtn ? submitBtn.textContent || submitBtn.value : '';
          if (submitBtn) {
            submitBtn.disabled = true;
            if (submitBtn.textContent !== undefined) {
              submitBtn.textContent = 'Joining...';
            } else if (submitBtn.value !== undefined) {
              submitBtn.value = 'Joining...';
            }
          }
          
          try {
            const response = await fetch('/api/waitlist', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                projectId: '${projectId}',
                email: email,
              }),
            });
            
            if (response.ok) {
              // Success
              emailInput.value = '';
              if (submitBtn) {
                if (submitBtn.textContent !== undefined) {
                  submitBtn.textContent = 'Joined! ✓';
                } else if (submitBtn.value !== undefined) {
                  submitBtn.value = 'Joined! ✓';
                }
                setTimeout(() => {
                  submitBtn.disabled = false;
                  if (submitBtn.textContent !== undefined) {
                    submitBtn.textContent = originalText;
                  } else if (submitBtn.value !== undefined) {
                    submitBtn.value = originalText;
                  }
                }, 2000);
              }
              
              // Show success message
              const successDiv = document.createElement('div');
              successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
              successDiv.textContent = 'Successfully joined the waitlist!';
              document.body.appendChild(successDiv);
              setTimeout(() => {
                document.body.removeChild(successDiv);
              }, 3000);
            } else {
              throw new Error('Failed to join waitlist');
            }
          } catch (error) {
            console.error('Error:', error);
            if (submitBtn) {
              submitBtn.disabled = false;
              if (submitBtn.textContent !== undefined) {
                submitBtn.textContent = originalText;
              } else if (submitBtn.value !== undefined) {
                submitBtn.value = originalText;
              }
            }
            
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
            errorDiv.textContent = 'Failed to join waitlist. Please try again.';
            document.body.appendChild(errorDiv);
            setTimeout(() => {
              if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
              }
            }, 3000);
          }
        });
      });
    </script>
  `;

  // Inject the script before closing body tag
  if (htmlContent.includes('</body>')) {
    return htmlContent.replace('</body>', formScript + '</body>');
  } else {
    return htmlContent + formScript;
  }
} 