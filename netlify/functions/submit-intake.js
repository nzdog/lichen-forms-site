import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

export const handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse form data
    const formData = JSON.parse(event.body);

    // Extract form fields
    const {
      'full-name': fullName,
      'email': email,
      'startup-name': startupName,
      'role': role,
      'q1': q1,
      'q2': q2,
      'q3': q3,
      'q4': q4,
      'q5': q5,
      'q6': q6
    } = formData;

    // Validate required fields
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Check if founder already exists by email
    const existingFounders = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Email',
        email: {
          equals: email
        }
      }
    });

    // Prepare properties for create or update
    const properties = {
      'Name': {
        title: [
          {
            text: {
              content: fullName || 'Unknown'
            }
          }
        ]
      },
      'Email': {
        email: email
      },
      'Startup Name': {
        rich_text: [
          {
            text: {
              content: startupName || ''
            }
          }
        ]
      },
      'Role': {
        rich_text: [
          {
            text: {
              content: role || ''
            }
          }
        ]
      },
      'Intake Timestamp': {
        date: {
          start: new Date().toISOString()
        }
      },
      'Intake Source': {
        select: {
          name: 'Website'
        }
      },
      'Q1 - What feels normal': {
        rich_text: [
          {
            text: {
              content: q1 || ''
            }
          }
        ]
      },
      'Q2 - What does field reward': {
        rich_text: [
          {
            text: {
              content: q2 || ''
            }
          }
        ]
      },
      'Q3 - How field holds during hard times': {
        rich_text: [
          {
            text: {
              content: q3 || ''
            }
          }
        ]
      },
      'Q4 - Quality of decisions': {
        rich_text: [
          {
            text: {
              content: q4 || ''
            }
          }
        ]
      },
      'Q5 - Cost of staying': {
        rich_text: [
          {
            text: {
              content: q5 || ''
            }
          }
        ]
      },
      'Q6 - Desired field': {
        rich_text: [
          {
            text: {
              content: q6 || ''
            }
          }
        ]
      }
    };

    let response;
    let isUpdate = false;

    if (existingFounders.results.length > 0) {
      // Update existing founder
      const existingPage = existingFounders.results[0];
      response = await notion.pages.update({
        page_id: existingPage.id,
        properties: properties
      });
      isUpdate = true;
    } else {
      // Create new founder
      response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: properties
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: isUpdate ? 'Founder profile updated successfully' : 'Founder profile created successfully',
        pageId: response.id,
        isUpdate: isUpdate
      })
    };

  } catch (error) {
    console.error('Error submitting to Notion:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to submit form',
        details: error.message
      })
    };
  }
};
