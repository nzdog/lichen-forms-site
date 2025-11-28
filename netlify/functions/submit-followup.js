import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

// Helper function to get all blocks from a page (handles pagination)
async function getAllBlocks(pageId) {
  let allBlocks = [];
  let cursor = undefined;

  while (true) {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
      start_cursor: cursor
    });

    allBlocks = allBlocks.concat(response.results);

    if (!response.has_more) {
      break;
    }
    cursor = response.next_cursor;
  }

  return allBlocks;
}

// Helper function to get text content from a rich_text array
function getPlainText(richTextArray) {
  if (!richTextArray || richTextArray.length === 0) return '';
  return richTextArray.map(rt => rt.plain_text).join('');
}

// Helper function to find a heading block by text content
function findHeadingByText(blocks, headingType, text) {
  return blocks.find(block => {
    if (block.type !== headingType) return false;
    const blockText = getPlainText(block[headingType].rich_text);
    return blockText.toLowerCase().includes(text.toLowerCase());
  });
}

// Helper function to create formatted response blocks
function createResponseBlocks(formType, responses) {
  const blocks = [];

  // Timestamp
  blocks.push({
    paragraph: {
      rich_text: [{
        text: { content: `**Submitted**: ${new Date().toISOString()}` }
      }]
    }
  });

  // Add blank line
  blocks.push({
    paragraph: {
      rich_text: [{ text: { content: '' } }]
    }
  });

  if (formType === '24h') {
    const questions = [
      '1. In a few words, how would you describe what the experience felt like?',
      '2. What, if anything, surprised you or stood out most strongly?',
      '3. After the session, did anything change in how you see your work or situation?',
      '4. If something did change, what was it?',
      '5. How would you describe your sense of agency (ability to choose or act) now compared with before?',
      '6. What feels easier, clearer, or more possible since the session?',
      '7. Optional — did anything shift in your body during or after the session?',
      '8. Optional — has anything changed in how your environment is affecting you since the session?',
      '9. Optional — if you told someone else about this experience, what would you say it is or does?'
    ];

    for (let i = 0; i < 9; i++) {
      const responseKey = `q${i + 1}`;
      if (responses[responseKey]) {
        blocks.push({
          paragraph: {
            rich_text: [
              { text: { content: `**${questions[i]}**\n`, bold: true } },
              { text: { content: responses[responseKey] } }
            ]
          }
        });

        // Add space between questions
        blocks.push({
          paragraph: {
            rich_text: [{ text: { content: '' } }]
          }
        });
      }
    }
  } else if (formType === '7d') {
    const questions = [
      '1. What has held or continued to shift over the past week?',
      '2. What has faded, returned, or stayed the same over the past week?',
      '3. What feels clearer or more possible now than it did a week ago?',
      '4. Has anything changed in how your environment is affecting you over the past week?',
      '5. Optional — have you noticed any somatic patterns over the past week?'
    ];

    for (let i = 0; i < 5; i++) {
      const responseKey = `q${i + 1}`;
      if (responses[responseKey]) {
        blocks.push({
          paragraph: {
            rich_text: [
              { text: { content: `**${questions[i]}**\n`, bold: true } },
              { text: { content: responses[responseKey] } }
            ]
          }
        });

        // Add space between questions
        blocks.push({
          paragraph: {
            rich_text: [{ text: { content: '' } }]
          }
        });
      }
    }
  }

  // Add separator
  blocks.push({
    divider: {}
  });

  return blocks;
}

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
    const { email, formType, ...responses } = formData;

    // Validate inputs
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    if (!formType || (formType !== '24h' && formType !== '7d')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid form type. Must be "24h" or "7d"' })
      };
    }

    // Find the founder by email
    const foundersResponse = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Email',
        email: {
          equals: email
        }
      }
    });

    if (foundersResponse.results.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'No founder found with this email. Please complete the intake form first.'
        })
      };
    }

    const founderPage = foundersResponse.results[0];

    // Get the Sessions relation property
    const sessionsRelation = founderPage.properties.Sessions?.relation || [];

    if (sessionsRelation.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'No sessions found for this founder. Please contact support.'
        })
      };
    }

    // Get the most recent session (last item in the relation array)
    const latestSessionId = sessionsRelation[sessionsRelation.length - 1].id;

    // Get all blocks from the session page
    const blocks = await getAllBlocks(latestSessionId);

    // Find or create the "Follow-Up" heading
    let followUpHeading = findHeadingByText(blocks, 'heading_2', 'Follow-Up');

    if (!followUpHeading) {
      // Create the Follow-Up section
      const newBlocks = await notion.blocks.children.append({
        block_id: latestSessionId,
        children: [
          {
            heading_2: {
              rich_text: [{ text: { content: 'Follow-Up' } }]
            }
          }
        ]
      });
      followUpHeading = newBlocks.results[0];
    }

    // Determine which update heading to look for
    const updateHeadingText = formType === '24h' ? '24-hour update' : '7-day update';

    // Find or create the specific update heading
    let updateHeading = findHeadingByText(blocks, 'heading_3', updateHeadingText);

    if (!updateHeading) {
      // Create the update heading under Follow-Up
      const newBlocks = await notion.blocks.children.append({
        block_id: followUpHeading.id,
        children: [
          {
            heading_3: {
              rich_text: [{ text: { content: updateHeadingText } }]
            }
          }
        ]
      });
      updateHeading = newBlocks.results[0];
    }

    // Create formatted response blocks
    const responseBlocks = createResponseBlocks(formType, responses);

    // Append the responses under the update heading
    await notion.blocks.children.append({
      block_id: updateHeading.id,
      children: responseBlocks
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `${formType === '24h' ? '24-hour' : '7-day'} follow-up submitted successfully`,
        sessionId: latestSessionId
      })
    };

  } catch (error) {
    console.error('Error submitting follow-up to Notion:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to submit follow-up',
        details: error.message
      })
    };
  }
};
